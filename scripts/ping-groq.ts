async function test(model: string) {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error("GROQ_API_KEY missing");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Reply with exactly: GROQ_OK" }],
      temperature: 0,
    }),
  });
  const data = await res.json();
  console.log(
    JSON.stringify({
      model,
      status: res.status,
      reply: data?.choices?.[0]?.message?.content ?? null,
      error: data?.error?.message ?? null,
    }),
  );
}

async function main() {
  for (const model of ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "allam-2-7b"]) {
    await test(model);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
