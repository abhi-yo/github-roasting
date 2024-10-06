import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface GitHubProfile {
  name?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  contributions?: {
    lastYear?: number;
  };
  bio?: string;
  location?: string;
  company?: string;
  hireable?: boolean;
}

interface RoastRequestBody {
  profileData: GitHubProfile;
  language: "english" | "hindi";
}

interface ApiError extends Error {
  details?: unknown;
}

const apiKey = process.env.GEMINI_API_KEY || "";
console.log(
  "Gemini API Key (masked):",
  apiKey.slice(0, 5) + "*".repeat(apiKey.length - 5)
);

const genAI = new GoogleGenerativeAI(apiKey);

async function generateRoast(
  profileData: GitHubProfile,
  language: "english" | "hindi"
): Promise<string> {
  if (!profileData) {
    throw new Error("Profile data is missing");
  }

  const {
    name,
    public_repos,
    followers,
    following,
    contributions,
    bio,
    location,
    company,
    hireable,
  } = profileData;

  const prompt =
    language === "hindi"
      ? `Generate a personalized, humorous roast in Hindi using English transliteration only for a GitHub user with the following ACCURATE profile data:
      Name: ${name || "Unknown"}
      Public Repositories: ${public_repos} (THIS IS THE CORRECT NUMBER OF REPOS)
      Followers: ${followers}
      Following: ${following}
      Contributions Last Year: ${contributions?.lastYear || "Unknown"}
      Bio: ${bio || "Not provided"}
      Location: ${location || "Not provided"}
      Company: ${company || "Not provided"}
      Hireable: ${hireable ? "Yes" : "No"}
      IMPORTANT: Ensure your roast accurately reflects the data provided, especially the number of public repositories (${public_repos}).
      Guidelines for the roast:
      - Restrict to <60 words
      - Create roast for Indian users in a natural-sounding way
      - Use English transliteration of Hindi phrases
      - Focus on the user's activity, bio, location, or any other interesting profile details
      - If their GitHub activity is impressive, acknowledge it humorously
      - Avoid generic roasts that could apply to anyone
      - Keep it light-hearted and avoid truly offensive content
      - Be creative and don't mention the number of repositories directly
      Now, generate a personalized, humorous roast for ${
        name || "this user"
      } based on their SPECIFIC GitHub profile data:`
      : `Generate a personalized, humorous roast in English for a GitHub user with the following ACCURATE profile data:
      Name: ${name || "Unknown"}
      Public Repositories: ${public_repos} (THIS IS THE CORRECT NUMBER OF REPOS)
      Followers: ${followers}
      Following: ${following}
      Contributions Last Year: ${contributions?.lastYear || "Unknown"}
      Bio: ${bio || "Not provided"}
      Location: ${location || "Not provided"}
      Company: ${company || "Not provided"}
      Hireable: ${hireable ? "Yes" : "No"}
      IMPORTANT: Ensure your roast accurately reflects the data provided, especially the number of public repositories (${public_repos}).
      Guidelines for the roast:
      - Restrict to <80 words
      - use slangs not proper grammar
      - Use pure English for the roast
      - Focus on witty wordplay and puns in English
      - Incorporate references to popular Western tech culture if relevant
      - Focus on the user's GitHub activity, bio, location, or any other interesting profile details
      - If their GitHub activity is impressive, acknowledge it humorously
      - Avoid generic roasts that could apply to anyone
      - Keep it light-hearted and avoid truly offensive content
      - Be creative and don't mention the number of repositories directly
      Now, generate a personalized, humorous roast for ${
        name || "this user"
      } based on their SPECIFIC GitHub profile data:`;

  try {
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-pro",
    });
    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini API");
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Detailed Gemini API error:", JSON.stringify(error, null, 2));
    const apiError: ApiError = new Error("Gemini API error");
    apiError.details = error;
    throw apiError;
  }
}

export async function POST(request: Request) {
  try {
    const { profileData, language } =
      (await request.json()) as RoastRequestBody;
    console.log("Received profile data:", JSON.stringify(profileData, null, 2));
    console.log("Requested language:", language);

    if (!profileData) {
      return NextResponse.json(
        { message: "Profile data is missing" },
        { status: 400 }
      );
    }

    if (language !== "english" && language !== "hindi") {
      return NextResponse.json(
        { message: "Invalid language specified. Use 'english' or 'hindi'." },
        { status: 400 }
      );
    }

    const roast = await generateRoast(profileData, language);
    return NextResponse.json({ roast });
  } catch (error) {
    console.error("Error in POST handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { message: "Error generating roast", error: errorMessage },
      { status: 500 }
    );
  }
}
