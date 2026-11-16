'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { submitPitch } from '@/app/actions/submitPitch';
import type { PitchPageData } from '@/lib/strapi';

// Figma (1920): input 690x64, textarea 690x96, radius 8, border 1px #1E1A1A 30%, padding 16, text 18px.
const fieldBase =
  'w-full border border-[#1E1A1A]/30 rounded-[6px] 2xl:rounded-[8px] px-[12px] 2xl:px-[16px] text-[13.5px] 2xl:text-[18px] text-[#1E1A1A] placeholder:text-[#1E1A1A]/50 outline-none focus:border-[#EE6723] transition-colors bg-white';
const inputCls = `${fieldBase} h-[48px] 2xl:h-[64px]`;
const textareaCls = `${fieldBase} block h-[72px] 2xl:h-[96px] py-[12px] 2xl:py-[16px] resize-y`;

// Figma: Rubik 400, 18px, line-height 150%, #000; 8px gap to the field.
const labelCls =
  'block text-[13.5px] 2xl:text-[18px] font-[400] leading-[150%] text-black mb-[6px] 2xl:mb-[8px]';

// Figma: 40px between one field and the next label.
const fieldsCls =
  'w-full max-w-[517.5px] 2xl:max-w-[690px] mx-auto flex flex-col gap-[30px] 2xl:gap-[40px]';

function SectionBanner({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    // Figma Rectangle 6738: 1410x178, gradient #EE6723 -> #FAA819 at 16% (exported asset)
    <div
      className="w-full h-[133.5px] 2xl:h-[178px] flex flex-col items-center justify-center text-center text-[#1E1A1A] mb-[30px] 2xl:mb-[40px]"
      style={{
        backgroundImage: "url('/images/pitch/section-banner.png')",
        backgroundSize: '100% 100%',
      }}
    >
      <span className="text-[13.5px] 2xl:text-[18px] font-[400] leading-[26.25px] 2xl:leading-[35px] uppercase opacity-80">
        {eyebrow}
      </span>
      <span className="text-[30px] 2xl:text-[40px] font-[500] leading-none opacity-80">
        {title}
      </span>
    </div>
  );
}

function DashedBorder({ active }: { active: boolean }) {
  // CSS dashed borders can't set dash length; Figma uses 2px with 8/8 dashes.
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
      <rect
        x="1"
        y="1"
        style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
        rx="7"
        fill="none"
        stroke={active ? '#EE6723' : 'rgba(30,26,26,0.5)'}
        strokeWidth="2"
        strokeDasharray="8 8"
      />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HTTP_RE = /^https?:\/\/\S+\.\S+/i;
/** Adds https:// when the person pasted a link without it. */
function withScheme(value: string): string {
  const v = value.trim();
  if (!v) return '';
  return /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
}

/** Only linkedin.com (or a subdomain like www.) pointing at a profile/page; any other website is rejected. */
function isLinkedInUrl(value: string): boolean {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    if (u.username || u.password) return false;
    const host = u.hostname.toLowerCase();
    return (host === 'linkedin.com' || host.endsWith('.linkedin.com')) && u.pathname.length > 1;
  } catch {
    return false;
  }
}

/** One place for every rule, so every field fails (and reads) the same way. Mirrors the server's checks. */
function validateForm(fd: FormData, linkedin: string[], deck: File | null): Record<string, string> {
  const val = (k: string) => String(fd.get(k) ?? '').trim();
  const e: Record<string, string> = {};

  if (val('founderName').length < 2) e.founderName = 'Please enter your name';
  if (!val('email')) e.email = 'Please enter your email';
  else if (!EMAIL_RE.test(val('email'))) e.email = 'Please enter a valid email address';

  if (!val('problemDescription')) e.problemDescription = 'Please describe the problem you are solving';
  if (!val('teamDescription')) e.teamDescription = 'Please tell us why you are the team to beat';
  if (!val('targetRoundSize')) e.targetRoundSize = 'Please enter the target round size';

  if (val('websiteLink') && !HTTP_RE.test(val('websiteLink'))) {
    e.websiteLink = 'Enter a full web address starting with http:// or https://';
  }
  const filled = linkedin.map((l) => l.trim()).filter(Boolean);
  if (filled.length === 0) e.linkedinLinks = 'Please add at least one LinkedIn profile link';
  else if (filled.some((l) => !isLinkedInUrl(l))) {
    e.linkedinLinks = 'Please enter a valid LinkedIn profile URL';
  }

  if (!val('sector')) e.sector = 'Please select a sector';
  if (!deck) e.pitchDeck = 'Please upload your pitch deck (PDF)';
  return e;
}

export default function PitchForm({ header, content }: { header?: React.ReactNode; content?: PitchPageData | null }) {
  // Every visible text comes from the Pitch Page single type in Strapi
  const t = (key: keyof PitchPageData): string => (content?.[key] as string | undefined) ?? '';
  const noneLabel = t('sectorNoneLabel');
  const sectorChoices = [noneLabel, ...(content?.sectorOptions ?? []).map((o) => o.label)];
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [linkedinLinks, setLinkedinLinks] = useState<string[]>(['']);
  const [sector, setSector] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // The upload box is not a native input, so a hidden one carries the browser's own
  // "required" bubble: it is invalid until a PDF has been chosen.
  const deckCheckRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    deckCheckRef.current?.setCustomValidity(selectedFile ? '' : 'Please upload your pitch deck (PDF)');
  }, [selectedFile]);

  // After a successful submission, show the thank-you for a while, then bring the empty form (and heading) back
  const SUCCESS_VISIBLE_MS = 8000;
  useEffect(() => {
    if (status !== 'success') return;
    const t = window.setTimeout(() => {
      setStatus('idle');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, SUCCESS_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [status]);

  // Custom sector dropdown (Figma design); a hidden input carries the native "required" bubble
  const [sectorOpen, setSectorOpen] = useState(false);
  const sectorBoxRef = useRef<HTMLDivElement>(null);
  const sectorCheckRef = useRef<HTMLInputElement>(null);
  const pickSector = (label: string, isNone = false) => {
    setSector(isNone ? '' : label);
    setSectorOpen(false);
    if (!isNone) clearError('sector');
  };
  useEffect(() => {
    sectorCheckRef.current?.setCustomValidity(sector ? '' : 'Please select a sector');
  }, [sector]);
  useEffect(() => {
    if (!sectorOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!sectorBoxRef.current?.contains(e.target as Node)) setSectorOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sectorOpen]);

  const MAX_PDF_MB = 5;
  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (!isPdf) {
      setFieldErrors((p) => ({ ...p, pitchDeck: 'Only PDF files are accepted' }));
      return;
    }
    if (f.size > MAX_PDF_MB * 1024 * 1024) {
      setFieldErrors((p) => ({ ...p, pitchDeck: `The file is larger than ${MAX_PDF_MB} MB` }));
      return;
    }
    setFieldErrors((p) => {
      const { pitchDeck: _removed, ...rest } = p;
      return rest;
    });
    setSelectedFile(f);
  };

  const Err = ({ name }: { name: string }) =>
    fieldErrors[name] ? (
      <p role="alert" className="mt-[6px] 2xl:mt-[8px] text-[11px] 2xl:text-[14px] leading-[1.4] text-red-600">
        {fieldErrors[name]}
      </p>
    ) : null;

  const clearError = (name: string) =>
    setFieldErrors((p) => {
      if (!p[name]) return p;
      const { [name]: _removed, ...rest } = p;
      return rest;
    });

  // Bring the first error into view
  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    document.querySelector('[role="alert"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [fieldErrors]);

  const addLinkedin = () => {
    if (linkedinLinks.length < 10) setLinkedinLinks((p) => [...p, '']);
  };
  const removeLinkedin = (i: number) => {
    setLinkedinLinks((p) => p.filter((_, idx) => idx !== i));
  };
  const updateLinkedin = (i: number, val: string) => {
    setLinkedinLinks((p) => p.map((v, idx) => (idx === i ? val : v)));
    clearError('linkedinLinks');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // "linkedin.com/in/jane" and "www.linkedin.com/in/jane" are fine: https:// is added for them
    const links = linkedinLinks.map(withScheme);
    links.forEach((link, i) => {
      if (link) fd.set(`linkedin_${i}`, link);
    });
    if (selectedFile) fd.set('pitchDeck', selectedFile, selectedFile.name);

    // Same check, same red message under the field, for every field (the browser's own bubbles are off)
    const errs = validateForm(fd, links, selectedFile);
    if (Object.keys(errs).length > 0) {
      setStatus('idle');
      setErrorMsg('');
      setFieldErrors(errs);
      return;
    }

    setStatus('idle');
    setErrorMsg('');
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitPitch(fd);
      if (result.success) {
        setStatus('success');
        formRef.current?.reset();
        setLinkedinLinks(['']);
        setSector('');
        setSelectedFile(null);
      } else {
        setStatus('error');
        setErrorMsg(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-[80px] 2xl:py-[120px] text-center px-6">
        <div
          className="w-[54px] 2xl:w-[72px] h-[54px] 2xl:h-[72px] rounded-full flex items-center justify-center mb-[18px] 2xl:mb-[24px]"
          style={{ background: 'linear-gradient(118.5deg, #EEAB41 0%, #DF6E38 100%)' }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7L26 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-[28px] 2xl:text-[36px] font-[500] text-[#1E1A1A] mb-[12px] 2xl:mb-[16px]">
          {t('successTitle')}
        </h2>
        <p className="text-[13.5px] 2xl:text-[18px] text-[#1E1A1A]/70 max-w-[360px] 2xl:max-w-[480px]">
          {t('successMessage')}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-[30px] 2xl:mt-[40px] w-[210px] 2xl:w-[280px] h-[42px] 2xl:h-[56px] rounded-[6px] 2xl:rounded-[8px] text-white font-[500] text-[13.5px] 2xl:text-[18px] transition-opacity hover:opacity-90 cursor-pointer"
          style={{ background: 'linear-gradient(118.5deg, #EEAB41 0%, #DF6E38 100%)' }}
        >
          {t('backToFormText')}
        </button>
      </div>
    );
  }

  return (
    <>
    {header}
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onInput={(e) => {
        const name = (e.target as HTMLInputElement).name;
        if (name) clearError(name);
      }}
      className="w-full"
      style={{ fontFamily: 'var(--font-rubik), Rubik, sans-serif' }}
    >
      {/* ── Section 1: Solution & Why You ──────────────────────────── */}
      <SectionBanner eyebrow={t('section1Eyebrow')} title={t('section1Title')} />

      <div className={`${fieldsCls} mb-[45px] 2xl:mb-[60px]`}>
        {/* Hidden spam trap - real visitors never see or fill this */}
        <input
          type="text"
          name="companyUrl"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div>
          <label className={labelCls}>{t('nameLabel')}</label>
          <input name="founderName" autoComplete="name" required maxLength={100} className={inputCls} />
          <Err name="founderName" />
        </div>

        <div>
          <label className={labelCls}>{t('emailLabel')}</label>
          <input name="email" type="email" autoComplete="email" required maxLength={254} className={inputCls} />
          <Err name="email" />
        </div>

        <div>
          <label className={labelCls}>{t('problemLabel')}</label>
          <textarea name="problemDescription" required maxLength={5000} className={textareaCls} />
          <Err name="problemDescription" />
        </div>

        <div>
          <label className={labelCls}>{t('teamLabel')}</label>
          <textarea name="teamDescription" required maxLength={5000} className={textareaCls} />
          <Err name="teamDescription" />
        </div>

        <div>
          <label className={labelCls}>{t('roundSizeLabel')}</label>
          <input name="targetRoundSize" required maxLength={200} className={inputCls} />
          <Err name="targetRoundSize" />
        </div>

        <div>
          <label className={labelCls}>{t('additionalInfoLabel')}</label>
          <textarea name="additionalInfo" maxLength={5000} className={textareaCls} />
          <Err name="additionalInfo" />
        </div>

        {/* Pitch deck upload — Figma Frame 1171277953: 690x197, bg #1E1A1A 4% */}
        <div className="relative">
          <label className={`${labelCls} !text-[#1E1A1A]/90`}>{t('pitchDeckLabel')}</label>
          <div
            className="relative w-full h-[147.75px] 2xl:h-[197px] rounded-[6px] 2xl:rounded-[8px] flex flex-col items-center pt-[27px] 2xl:pt-[36px] text-[#1E1A1A] text-center cursor-pointer transition-colors"
            style={{ background: dragActive ? 'rgba(238,103,35,0.06)' : 'rgba(30,26,26,0.04)' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <DashedBorder active={dragActive} />
            <Image
              src="/images/upload-icon.svg"
              alt=""
              width={32}
              height={32}
              className="w-[24px] h-[24px] 2xl:w-[32px] 2xl:h-[32px]"
            />
            {selectedFile ? (
              <>
                <p className="mt-[6px] 2xl:mt-[8px] text-[12px] 2xl:text-[16px] leading-none font-[500] text-[#EE6723]">
                  {selectedFile.name}
                </p>
                <p className="mt-[8.25px] 2xl:mt-[11px] text-[10.5px] 2xl:text-[14px] leading-none opacity-70">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <span className="mt-[20.25px] 2xl:mt-[27px] text-[13.5px] 2xl:text-[18px] leading-none font-[500] underline">
                  {t('changeFileText')}
                </span>
              </>
            ) : (
              <>
                <p className="mt-[6px] 2xl:mt-[8px] text-[12px] 2xl:text-[16px] leading-none">
                  {t('uploadPrompt')}
                </p>
                <p className="mt-[8.25px] 2xl:mt-[11px] text-[10.5px] 2xl:text-[14px] leading-none opacity-70">
                  {t('uploadHint')}
                </p>
                <span className="mt-[20.25px] 2xl:mt-[27px] text-[13.5px] 2xl:text-[18px] leading-none font-[500] underline">
                  {t('browseText')}
                </span>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Carries the native validation bubble for the upload box (not submitted) */}
          <input
            ref={deckCheckRef}
            tabIndex={-1}
            aria-hidden="true"
            value={selectedFile?.name ?? ''}
            onChange={() => {}}
            className="absolute left-1/2 bottom-[24px] h-px w-px opacity-0 pointer-events-none"
          />
          <Err name="pitchDeck" />
        </div>

        <div>
          <label className={labelCls}>{t('websiteLabel')}</label>
          <input
            name="websiteLink"
            type="url"
            maxLength={500}
            pattern="https?://.+"
            title="Enter a full web address starting with http:// or https://"
            className={inputCls}
          />
          <Err name="websiteLink" />
        </div>

        {/* LinkedIn links — Figma Frame 1171278002: vertical, gap 16 */}
        <div className="flex flex-col gap-[12px] 2xl:gap-[16px]">
          <div>
            <span className="block text-[13.5px] 2xl:text-[18px] font-[400] leading-[150%] text-black">
              {t('linkedinLabel')}
            </span>
            <span className="block text-[10.5px] 2xl:text-[14px] leading-none text-[#1E1A1A] opacity-70">
              {t('linkedinHint')}
            </span>
          </div>
          {linkedinLinks.map((link, i) => (
            <div key={i} className="relative">
              <input
                value={link}
                onChange={(e) => updateLinkedin(i, e.target.value)}
                type="url"
                maxLength={300}
                pattern="https?://([a-zA-Z0-9-]+\.)*linkedin\.com/.+"
                title="Enter a LinkedIn link, e.g. https://www.linkedin.com/in/your-name"
                className={inputCls}
                aria-label={`Co-founder LinkedIn link ${i + 1}`}
              />
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeLinkedin(i)}
                  className="absolute right-[-30px] 2xl:right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity"
                  aria-label="Remove link"
                >
                  <Image src="/images/trash-icon.svg" alt="" width={24} height={24} className="w-[18px] h-[18px] 2xl:w-[24px] 2xl:h-[24px]" />
                </button>
              )}
            </div>
          ))}
          {linkedinLinks.length < 10 && (
            <button
              type="button"
              onClick={addLinkedin}
              className="flex items-center gap-[6px] 2xl:gap-[8px] text-[13.5px] 2xl:text-[18px] font-[400] leading-none text-[#1E1A1A] hover:text-[#EE6723] transition-colors w-fit cursor-pointer"
            >
              <svg className="w-[18px] h-[18px] 2xl:w-[24px] 2xl:h-[24px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {t('addMoreText')}
            </button>
          )}
          <Err name="linkedinLinks" />
        </div>
      </div>

      {/* ── Section 2: Market & Audience ───────────────────────────── */}
      <SectionBanner eyebrow={t('section2Eyebrow')} title={t('section2Title')} />

      <div className={`${fieldsCls} mb-[45px] 2xl:mb-[60px]`}>
        <div>
          <label className={labelCls}>{t('sectorLabel')}</label>
          <div className="relative" ref={sectorBoxRef}>
            {/* Carries the native "required" bubble; its value is what gets submitted */}
            <input
              ref={sectorCheckRef}
              name="sector"
              value={sector}
              onChange={() => {}}
              tabIndex={-1}
              aria-hidden="true"
              className="absolute left-1/2 bottom-0 h-px w-px opacity-0 pointer-events-none"
            />
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sectorOpen}
              onClick={() => setSectorOpen((o) => !o)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSectorOpen(false);
              }}
              className={`${inputCls} flex items-center text-left cursor-pointer pr-[40px] 2xl:pr-[56px] ${sector ? '' : '!text-[#1E1A1A]/50'}`}
            >
              {sector || t('sectorPlaceholder')}
            </button>
            <svg
              className={`pointer-events-none absolute right-[12px] 2xl:right-[16px] top-[24px] 2xl:top-[32px] -translate-y-1/2 w-[18px] h-[18px] 2xl:w-[24px] 2xl:h-[24px] transition-transform ${sectorOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="#1E1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* Figma Form/Web dropdown: 690 wide panel (8px side padding), rows 36 high, gap 4, selected #3887CF radius 4 */}
            {sectorOpen && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 m-0 flex flex-col gap-[3px] 2xl:gap-[4px] list-none rounded-[6px] 2xl:rounded-[8px] bg-white px-[6px] py-[4.5px] 2xl:px-[8px] 2xl:py-[6px] border border-[#1E1A1A]/10"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
              >
                {sectorChoices.map((label, optIdx) => {
                  const isNone = optIdx === 0;
                  const selected = isNone ? !sector : sector === label;
                  return (
                    <li
                      key={label}
                      role="option"
                      aria-selected={selected}
                      tabIndex={0}
                      onClick={() => pickSector(label, isNone)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          pickSector(label, isNone);
                        }
                        if (e.key === 'Escape') setSectorOpen(false);
                      }}
                      className={`flex items-center h-[27px] 2xl:h-[36px] px-[6px] 2xl:px-[8px] rounded-[3px] 2xl:rounded-[4px] cursor-pointer font-[400] tracking-normal text-[12px] leading-[24px] 2xl:text-[16px] 2xl:leading-[32px] outline-none ${
                        selected ? 'bg-[#3887CF] text-white' : 'text-black hover:bg-black/5 focus:bg-black/5'
                      }`}
                    >
                      <span className="inline-block w-[12px] 2xl:w-[16px] mr-[6px] 2xl:mr-[8px] text-center leading-none">
                        {selected && !isNone ? '✓' : ''}
                      </span>
                      {label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <Err name="sector" />
        </div>

        <div>
          <label className={labelCls}>{t('marketLabel')}</label>
          <textarea name="marketSize" maxLength={5000} className={textareaCls} />
          <Err name="marketSize" />
        </div>

        <div>
          <label className={labelCls}>{t('customerLabel')}</label>
          <textarea name="customerValueProp" maxLength={5000} className={textareaCls} />
          <Err name="customerValueProp" />
        </div>

        <div>
          <label className={labelCls}>{t('solutionLabel')}</label>
          <textarea name="solution10x" maxLength={5000} className={textareaCls} />
          <Err name="solution10x" />
        </div>
      </div>

      {status === 'error' && (
        <div className="w-full max-w-[517.5px] 2xl:max-w-[690px] mx-auto mb-[24px]">
          <div className="flex items-start gap-[12px] bg-red-50 border border-red-200 rounded-[8px] px-[16px] py-[14px]">
            <svg className="shrink-0 mt-[1px]" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M9 5.5v4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="9" cy="12.5" r="1" fill="#ef4444"/>
            </svg>
            <p className="text-[13px] 2xl:text-[15px] text-red-600 leading-[1.5]">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Submit — Figma Button.svg: 280x56, radius 8, #EEAB41 -> #DF6E38 */}
      <div className="w-full flex justify-center pb-[90px] 2xl:pb-[120px]">
        <button
          type="submit"
          disabled={isPending}
          className="w-[210px] 2xl:w-[280px] h-[42px] 2xl:h-[56px] rounded-[6px] 2xl:rounded-[8px] text-white font-[500] text-[13.5px] 2xl:text-[18px] transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(118.5deg, #EEAB41 0%, #DF6E38 100%)' }}
        >
          {isPending ? t('submittingText') : t('submitText')}
        </button>
      </div>
    </form>
    </>
  );
}
