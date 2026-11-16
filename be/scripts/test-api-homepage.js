async function main() {
  const res = await fetch('http://localhost:1337/api/homepage');
  const json = await res.json();
  const comps = json.data?.addYourLayout || [];
  console.log('Homepage components returned from /api/homepage:');
  for (const c of comps) {
    console.log('-', c.__component, 'id:', c.id, Object.keys(c));
    if (c.__component === 'thesis.bottom-slider-heading') {
      console.log('  bottomSliderHeading:', JSON.stringify(c, null, 2));
    }
  }
}
main().catch(console.error);
