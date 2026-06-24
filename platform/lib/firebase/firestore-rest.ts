import "server-only";
import { getAccessToken } from "./auth-rest";

const PROJECT_ID = () => process.env.FIREBASE_ADMIN_PROJECT_ID!;
const BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID()}/databases/(default)/documents`;

async function firestoreRequest(
  path: string,
  method = "GET",
  body?: unknown
): Promise<unknown> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE()}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore REST ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } };

function fromFirestore(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if ("stringValue" in v) out[k] = v.stringValue;
    else if ("integerValue" in v) out[k] = Number(v.integerValue);
    else if ("booleanValue" in v) out[k] = v.booleanValue;
    else if ("nullValue" in v) out[k] = null;
    else if ("timestampValue" in v) out[k] = v.timestampValue;
    else if ("mapValue" in v) out[k] = fromFirestore(v.mapValue.fields ?? {});
    else if ("arrayValue" in v) out[k] = (v.arrayValue.values ?? []).map((i) => fromFirestore((i as { mapValue: { fields: Record<string, FirestoreValue> } }).mapValue?.fields ?? {}));
  }
  return out;
}

export async function deleteDoc(collection: string, docId: string): Promise<void> {
  await firestoreRequest(`${collection}/${docId}`, "DELETE");
}

export async function getCollection(
  collection: string
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const res = await firestoreRequest(collection) as {
    documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }>;
  } | null;
  if (!res?.documents) return [];
  return res.documents.map((doc) => ({
    id: doc.name.split("/").pop()!,
    data: fromFirestore(doc.fields ?? {}),
  }));
}

function toFirestoreValue(v: unknown): FirestoreValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { stringValue: String(v) };
  return { nullValue: null };
}

export async function updateDocFields(
  docPath: string,
  fields: Record<string, unknown>
): Promise<void> {
  const token = await getAccessToken();
  const fieldPaths = Object.keys(fields).map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
  const url = `${BASE()}/${docPath}?${fieldPaths}`;
  const firestoreFields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(fields)) firestoreFields[k] = toFirestoreValue(v);
  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: firestoreFields }),
  });
  if (!res.ok) throw new Error(`Firestore PATCH ${res.status}: ${await res.text()}`);
}

export async function querySubCollection(
  parentPath: string,
  collectionId: string,
  orderBy?: { field: string; direction: "ASCENDING" | "DESCENDING" }
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const token = await getAccessToken();
  const parent = `projects/${PROJECT_ID()}/databases/(default)/documents/${parentPath}`;
  const url = `https://firestore.googleapis.com/v1/${parent}:runQuery`;
  const query: Record<string, unknown> = {
    from: [{ collectionId }],
  };
  if (orderBy) {
    query.orderBy = [{ field: { fieldPath: orderBy.field }, direction: orderBy.direction }];
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: query }),
  });
  if (!res.ok) throw new Error(`Firestore runQuery ${res.status}: ${await res.text()}`);
  const rows = await res.json() as Array<{ document?: { name: string; fields?: Record<string, FirestoreValue> } }>;
  return rows
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document!.name.split("/").pop()!,
      data: fromFirestore(r.document!.fields ?? {}),
    }));
}
