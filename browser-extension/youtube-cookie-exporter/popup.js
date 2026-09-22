const button = document.querySelector("#export");
const status = document.querySelector("#status");

const cookieDomains = [
  "youtube.com",
  ".youtube.com",
  "google.com",
  ".google.com",
  "accounts.google.com",
];

function escapeNetscapeField(value) {
  return String(value).replaceAll("\\t", " ").replaceAll("\\r", " ").replaceAll("\\n", " ");
}

function toNetscapeLine(cookie) {
  const domain = escapeNetscapeField(cookie.domain);
  const includeSubdomains = cookie.domain.startsWith(".") ? "TRUE" : "FALSE";
  const path = escapeNetscapeField(cookie.path || "/");
  const secure = cookie.secure ? "TRUE" : "FALSE";
  const expiration = cookie.expirationDate ? Math.floor(cookie.expirationDate) : 0;
  const name = escapeNetscapeField(cookie.name);
  const value = escapeNetscapeField(cookie.value);
  return [domain, includeSubdomains, path, secure, expiration, name, value].join("\\t");
}

async function getCookies() {
  const cookies = await Promise.all(
    cookieDomains.map((domain) => chrome.cookies.getAll({ domain })),
  );
  const unique = new Map();
  for (const cookieList of cookies) {
    for (const cookie of cookieList) {
      const key = [cookie.domain, cookie.path, cookie.name].join("\\u0000");
      unique.set(key, cookie);
    }
  }
  return [...unique.values()];
}

button.addEventListener("click", async () => {
  button.disabled = true;
  status.textContent = "Reading cookies...";
  try {
    const cookies = await getCookies();
    if (!cookies.length) {
      throw new Error("No cookies found. Login to YouTube first.");
    }
    const contents = [
      "# Netscape HTTP Cookie File",
      "# Exported locally by Campucino YouTube Cookie Exporter",
      ...cookies.map(toNetscapeLine),
      "",
    ].join("\\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/plain" }));
    await chrome.downloads.download({
      url,
      filename: "youtube-cookies.txt",
      saveAs: true,
    });
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    status.textContent = `${cookies.length} cookies exported.`;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Export failed.";
  } finally {
    button.disabled = false;
  }
});
