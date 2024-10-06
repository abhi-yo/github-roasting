import axios from "axios";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600 });

export async function POST(req: Request) {
  const { username } = await req.json();

  const cachedProfile = cache.get(username);
  if (cachedProfile) {
    return new Response(JSON.stringify(cachedProfile), { status: 200 });
  }

  const token = process.env.GITHUB_TOKEN;

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );

    const contributionsResponse = await axios.get(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
    );

    const profileData = {
      ...response.data,
      contributions: contributionsResponse.data.total,
    };

    cache.set(username, profileData);
    return new Response(JSON.stringify(profileData), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching GitHub profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch GitHub profile" }),
      { status: 500 }
    );
  }
}
