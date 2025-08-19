export function env_url() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  switch (environment) {
    case "PRODUCTION":
      return "https://hottake.gg/api";
      break;
    case "PREVIEW_MAIN":
      return "https://hot-take-git-main-jgoon.vercel.app/api";
      break;
    case "PREVIEW":
      return "https://hot-take-git-prod-jgoon.vercel.app/api";
      break;
    case "DEV":
      return "http://localhost:3000/api"; // idk this link....
      break;
    case "LOCAL":
      return "http://localhost:3000/api";
      break;
    default:
      return "http://localhost:3000/api";
      break;
  }
}
