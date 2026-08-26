async function inspectPipeline() {
  const res = await fetch('http://localhost:5000/api/crm/pipeline');
  const json = await res.json();
  console.log('STATUS:', res.status);
  console.log('JSON:', JSON.stringify(json, null, 2));
}
inspectPipeline();
