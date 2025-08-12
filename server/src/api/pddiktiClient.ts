import axios from "axios";

const BASE_URL =
  process.env.PDDIKTI_BASE_URL || "https://api-pddikti.kemdiktisaintek.go.id";

export const pddikti = axios.create({
  baseURL: BASE_URL,
  // You can add headers if needed in future (auth, etc.)
  timeout: 10000,
});

export async function searchPerguruanTinggi(keyword: string) {
  const safe = encodeURIComponent(keyword.trim());
  const res = await pddikti.get(`/pencarian/pt/${safe}`);
  return res.data; // Pass-through raw payload; service will adapt if needed
}

export async function getPerguruanTinggiDetail(idPt: string) {
  const res = await pddikti.get(`/pt/detail/${encodeURIComponent(idPt)}`);
  return res.data;
}

export async function searchProdi(keyword: string) {
  const res = await pddikti.get(
    `/pencarian/prodi/${encodeURIComponent(keyword.trim())}`
  );
  return res.data;
}

export async function getProdiDetail(idProdi: string) {
  const res = await pddikti.get(`/prodi/detail/${encodeURIComponent(idProdi)}`);
  return res.data;
}
