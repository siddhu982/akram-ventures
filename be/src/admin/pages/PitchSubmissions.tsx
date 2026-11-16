import { useEffect, useState } from 'react';
import { Layouts, Page, useFetchClient } from '@strapi/strapi/admin';
import { Box, Button, Flex, Table, Tbody, Td, Th, Thead, Tr, Typography, Loader } from '@strapi/design-system';
import { ArrowLeft, Trash, Eye, Download } from '@strapi/icons';

type Media = { id: number; name: string; url: string; size?: number } | null;

type Pitch = {
  id: number;
  documentId: string;
  founderName?: string;
  email?: string;
  problemDescription?: string;
  teamDescription?: string;
  targetRoundSize?: string;
  additionalInfo?: string;
  websiteLink?: string;
  linkedinLinks?: string[] | null;
  sector?: string;
  marketSize?: string;
  customerValueProp?: string;
  solution10x?: string;
  pitchDeck?: Media;
  createdAt: string;
};

const SECTORS: Record<string, string> = {
  fintech: 'Fintech',
  healthtech: 'Healthtech',
  edtech: 'Edtech',
  agritech: 'Agritech',
  saas: 'SaaS',
  ecommerce: 'E-Commerce',
  logistics: 'Logistics & Supply Chain',
  consumer: 'Consumer',
  deeptech: 'Deep Tech / AI',
  cleantech: 'Clean Tech / Climate',
  other: 'Other',
};

const sectorLabel = (v?: string) => (v ? SECTORS[v] || v : '');
const linksOf = (p: Pitch) => (Array.isArray(p.linkedinLinks) ? p.linkedinLinks : []);
const fmtDate = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const fmtSize = (kb?: number) => (!kb ? '' : kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);

const openDeck = (m: NonNullable<Media>) => window.open(m.url, '_blank', 'noopener,noreferrer');

/* ─────────── Entry: label + value table ─────────── */

const Text = ({ children }: { children?: React.ReactNode }) =>
  children ? (
    <Typography style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children}</Typography>
  ) : (
    <Typography textColor="neutral500">—</Typography>
  );

function Detail({ p }: { p: Pitch }) {
  const deck = p.pitchDeck;
  const links = linksOf(p);

  const rows: [string, React.ReactNode][] = [
    ['Name', <Text>{p.founderName}</Text>],
    ['Email', <Text>{p.email}</Text>],
    ['Please describe the problem you are solving?', <Text>{p.problemDescription}</Text>],
    ['Why are you the team to beat?', <Text>{p.teamDescription}</Text>],
    ['What is the target round size?', <Text>{p.targetRoundSize}</Text>],
    ['Additional Info', <Text>{p.additionalInfo}</Text>],
    [
      'Pitch Deck',
      deck ? (
        <Flex gap={4} wrap="wrap" alignItems="center">
          <Typography>
            {deck.name} {deck.size ? `(${fmtSize(deck.size)})` : ''}
          </Typography>
          <Button size="S" variant="secondary" startIcon={<Eye />} onClick={() => openDeck(deck)}>
            View pitch deck
          </Button>
          <Button size="S" variant="tertiary" startIcon={<Download />} onClick={() => openDeck(deck)}>
            Download
          </Button>
        </Flex>
      ) : (
        <Text />
      ),
    ],
    ['Website link', <Text>{p.websiteLink}</Text>],
    ['LinkedIn profile links of Co-founders', <Text>{links.join('\n')}</Text>],
    ['Which of these sectors best define the business you are in?', <Text>{sectorLabel(p.sector)}</Text>],
    ['How big is the market for this and what are current friction points?', <Text>{p.marketSize}</Text>],
    ['Who is your customer and what is the value proposition?', <Text>{p.customerValueProp}</Text>],
    ['Why is your solution 10x better?', <Text>{p.solution10x}</Text>],
    ['Submitted', <Text>{fmtDate(p.createdAt)}</Text>],
  ];

  return (
    <Table colCount={2} rowCount={rows.length}>
      <Thead>
        <Tr>
          <Th>
            <Typography variant="sigma">Question</Typography>
          </Th>
          <Th>
            <Typography variant="sigma">Answer</Typography>
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map(([label, value]) => (
          <Tr key={label}>
            <Td style={{ width: '34%', verticalAlign: 'top' }}>
              <Typography fontWeight="bold">{label}</Typography>
            </Td>
            <Td style={{ verticalAlign: 'top' }}>{value}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

/* ─────────── List: every field as a column ─────────── */

const clamp = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
} as const;

const clip = (v?: string) =>
  v ? (
    <Typography style={clamp} title={v}>
      {v}
    </Typography>
  ) : (
    <Typography textColor="neutral500">—</Typography>
  );

const plain = (v?: string) => <Typography textColor={v ? undefined : 'neutral500'}>{v || '—'}</Typography>;

type Col = { head: string; width: number; cell: (p: Pitch) => React.ReactNode };

const COLS: Col[] = [
  { head: 'Submitted', width: 140, cell: (p) => plain(fmtDate(p.createdAt)) },
  { head: 'Name', width: 150, cell: (p) => plain(p.founderName) },
  { head: 'Email', width: 210, cell: (p) => plain(p.email) },
  { head: 'Sector', width: 140, cell: (p) => plain(sectorLabel(p.sector)) },
  { head: 'Round size', width: 110, cell: (p) => plain(p.targetRoundSize) },
  {
    head: 'Pitch deck',
    width: 150,
    cell: (p) =>
      p.pitchDeck ? (
        <Button
          size="S"
          variant="secondary"
          startIcon={<Eye />}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            openDeck(p.pitchDeck as NonNullable<Media>);
          }}
        >
          View
        </Button>
      ) : (
        plain('')
      ),
  },
  { head: 'Website', width: 180, cell: (p) => plain(p.websiteLink) },
  { head: 'LinkedIn', width: 220, cell: (p) => clip(linksOf(p).join('\n')) },
  { head: 'Problem', width: 260, cell: (p) => clip(p.problemDescription) },
  { head: 'Team', width: 260, cell: (p) => clip(p.teamDescription) },
  { head: 'Additional info', width: 220, cell: (p) => clip(p.additionalInfo) },
  { head: 'Market size', width: 220, cell: (p) => clip(p.marketSize) },
  { head: 'Customer & value', width: 220, cell: (p) => clip(p.customerValueProp) },
  { head: '10x better', width: 220, cell: (p) => clip(p.solution10x) },
];

function List({ items, onOpen }: { items: Pitch[]; onOpen: (id: string) => void }) {
  return (
    <Table colCount={COLS.length} rowCount={items.length}>
      <Thead>
        <Tr>
          {COLS.map((c) => (
            <Th key={c.head} style={{ minWidth: c.width }}>
              <Typography variant="sigma">{c.head}</Typography>
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {items.map((p) => (
          <Tr key={p.documentId} onClick={() => onOpen(p.documentId)} style={{ cursor: 'pointer' }}>
            {COLS.map((c) => (
              <Td key={c.head} style={{ verticalAlign: 'top', minWidth: c.width }}>
                {c.cell(p)}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

/* ─────────── Page ─────────── */

export default function PitchSubmissions() {
  const { get, del } = useFetchClient();
  const [items, setItems] = useState<Pitch[]>([]);
  const [selected, setSelected] = useState<string | null>(() => new URLSearchParams(window.location.search).get('id'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const base = '/content-manager/collection-types/api::pitch-submission.pitch-submission';

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await get<{ results: Pitch[] }>(base, {
        params: { page: 1, pageSize: 100, sort: 'createdAt:desc', populate: 'pitchDeck' },
      });
      setItems(data.results || []);
      setError('');
    } catch {
      setError('Could not load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = items.find((i) => i.documentId === selected);

  const remove = async () => {
    if (!current || !window.confirm(`Delete the pitch from ${current.founderName}? This cannot be undone.`)) return;
    await del(`${base}/${current.documentId}`);
    setSelected(null);
    load();
  };

  const back = (
    <Button variant="tertiary" startIcon={<ArrowLeft />} onClick={() => setSelected(null)}>
      Back
    </Button>
  );

  return (
    <Page.Main>
      <Layouts.Header
        title={current ? current.founderName || 'Pitch submission' : 'Pitch Submissions'}
        subtitle={
          current
            ? `Submitted ${fmtDate(current.createdAt)}`
            : loading
              ? 'Loading…'
              : `${items.length} entr${items.length === 1 ? 'y' : 'ies'} found`
        }
        navigationAction={current ? back : undefined}
        primaryAction={
          current ? (
            <Button variant="danger-light" startIcon={<Trash />} onClick={remove}>
              Delete
            </Button>
          ) : undefined
        }
      />
      <Layouts.Content>
        {loading && (
          <Flex justifyContent="center" padding={8}>
            <Loader>Loading…</Loader>
          </Flex>
        )}
        {error && <Typography textColor="danger600">{error}</Typography>}
        {!loading && !error && !current && items.length === 0 && <Typography>No submissions yet.</Typography>}
        {!loading && current && <Detail p={current} />}
        {!loading && !current && items.length > 0 && (
          <Box style={{ overflowX: 'auto' }}>
            <List items={items} onOpen={setSelected} />
          </Box>
        )}
      </Layouts.Content>
    </Page.Main>
  );
}
