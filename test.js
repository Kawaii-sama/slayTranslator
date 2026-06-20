async function test() {
  const text = "namaste mera naam Pratibha hai";
  const sl = "hi";
  const tl = "en";

  try {
    const url = `https://lingva.ml/api/v1/${sl}/${tl}/${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Lingva: "${data.translation}"`);
  } catch (e) {
    console.log(`Lingva error: ${e.message}`);
  }
}
test();
