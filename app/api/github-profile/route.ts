import axios, { AxiosError } from "axios";
import NodeCache from "node-cache";
import { NextResponse } from "next/server";

// Type definitions
interface GitHubProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

interface ContributionsResponse {
  total: number;
}

interface ProfileDataResponse extends GitHubProfile {
  contributions: number;
}

const cache = new NodeCache({ stdTTL: 3600 });

export async function POST(req: Request) {
  try {
    const { username } = (await req.json()) as { username: string };

    const cachedProfile = cache.get<ProfileDataResponse>(username);
    if (cachedProfile) {
      return NextResponse.json(cachedProfile);
    }

    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error("GitHub token is not set");
    }

    const [profileResponse, contributionsResponse] = await Promise.all([
      axios.get<GitHubProfile>(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      }),
      axios.get<ContributionsResponse>(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
      ),
    ]);

    const profileData: ProfileDataResponse = {
      ...profileResponse.data,
      contributions: contributionsResponse.data.total,
    };

    cache.set(username, profileData);
    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        return NextResponse.json(
          {
            error: "Failed to fetch GitHub profile",
            details: axiosError.response.data,
          },
          { status: axiosError.response.status }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch GitHub profile" },
      { status: 500 }
    );
  }
}
