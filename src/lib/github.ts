export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
}

export async function fetchPinnedRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/Nemocccc/repos?sort=updated&per_page=20",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const repos: GitHubRepo[] = await res.json();
    // Sort by stars desc, take top 6
    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function fetchProfile(): Promise<{
  followers: number;
  following: number;
  public_repos: number;
} | null> {
  try {
    const res = await fetch("https://api.github.com/users/Nemocccc", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
