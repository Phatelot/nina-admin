import { Octokit } from "octokit"
import type { Weighing as Weighin } from "./model";

const owner = 'phatelot';
const repo = 'nina';
const branch = 'main';

let octokit: Octokit;
let token: string = (() => {
    const token = getGithubToken() || '';
    if (token) {
      octokit = new Octokit({
        auth: token,
      });
    }
    return token;
})();

export function octokitReady(): boolean {
	return !!octokit;
}

export function updateGithubToken(newToken: string) {
	token = newToken;
	localStorage.setItem('nina-admin', token);
	octokit = new Octokit({
		auth: token,
	});
}

export function getGithubToken(): string | null {
	return localStorage.getItem('nina-admin');
}

export async function uploadWeighinImageToRepo(weighinNumber: number, fileContent: string) {
	return uploadImageToRepo(`${padNumberLeft(weighinNumber)}.png`, fileContent);
}

function padNumberLeft(n: number): string {
    let result = `${n}`
    return '0'.repeat(3 - result.length) + result;
  }

async function uploadImageToRepo(imageName: string, fileContent: string) {
	if (!octokitReady()) {
		throw new Error('please fill in Github token')
	}

	return await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
		owner,
		repo,
		branch,
		path: `public/images/${imageName}`,
		message: `add ${imageName}`,
		content: fileContent,
	})
}

export async function uploadWeighingsToRepo(data: Weighin[], sha: string) {
	if (!octokitReady()) {
		throw new Error('please fill in Github token')
	}

	return await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
		owner,
		repo,
		branch,
		path: `src/lib/weighings.json`,
		message: `update weighins`,
		content: window.btoa(JSON.stringify(data, null, 2)),
		sha,
	})
}

export async function getWeighings(): Promise<{data: Weighin[], sha: string}> {
	if (!octokitReady()) {
		throw new Error('please fill in Github token')
	}

	return await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
		owner,
		repo,
		branch,
		path: 'src/lib/weighings.json',
	}).then(r => {
		const {content, sha} = (r.data as any);
		const parsedContent = JSON.parse(window.atob(content)) as Weighin[];
		return {
			data: parsedContent,
			sha,
		};
	})
}
