/**
 * gitCmsService.ts
 *
 * Utilizes the GitHub REST API to perform a file update directly to the repository.
 * This effectively acts as the backend for the "Build-Time Option 1" Micro CMS.
 */

export interface GitHubConfig {
    token: string;
    owner: string;
    repo: string;
    branch: string;
}

export const saveCmsToGithub = async (
    config: GitHubConfig,
    filePath: string,
    newContent: any,
    commitMessage: string = "Update CMS content"
): Promise<void> => {
    const { token, owner, repo, branch } = config;

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
    };

    try {
        // 1. Get the current file SHA (required by GitHub API to update an existing file)
        let sha = '';
        const getRes = await fetch(url + `?ref=${branch}`, { headers });
        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        } else if (getRes.status !== 404) {
            throw new Error(`Failed to fetch file SHA: ${getRes.statusText}`);
        }

        // 2. Prepare the payload
        // The JSON file content needs to be perfectly formatted as string, then Base64 encoded
        const contentStr = JSON.stringify(newContent, null, 2);

        // Base64 encode in browser
        const base64Content = btoa(unescape(encodeURIComponent(contentStr)));

        const payload = {
            message: commitMessage,
            content: base64Content,
            branch,
            ...(sha ? { sha } : {}), // only include if file exists
        };

        // 3. Put the new file
        const putRes = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
        });

        if (!putRes.ok) {
            const errData = await putRes.json();
            throw new Error(`GitHub API Error: ${errData.message}`);
        }

    } catch (e: any) {
        throw new Error(`CMS GitHub Save Failed: ${e.message}`);
    }
};
