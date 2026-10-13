/**
 * Temporary in-memory stand-in for the notes API, which doesn't exist yet.
 *
 * Only the useGetNotes / useDeleteNote hooks talk to this module, so when the
 * real endpoints land, swapping it out is a change in those hooks alone.
 * Delete this file at that point.
 */

/**
 * Only NOTE is reachable today. The other two are modelled so the column
 * exists from the start, but nothing creates them yet.
 */
export type RecreationResourceNoteType = 'NOTE' | 'REFERENCE' | 'FILE';

export interface RecreationResourceNoteUIModel {
  note_id: string;
  rec_resource_id: string;
  note_type: RecreationResourceNoteType;
  title: string;
  /** Rich text HTML produced by the Quill editor */
  body: string;
  /** ISO date string */
  date_logged: string;
  created_by: string;
}

const LATENCY_MS = 300;

// Deliberate fake latency so the loading states get exercised.
// eslint-disable-next-line promise/avoid-new
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

const seedNotes = (recResourceId: string): RecreationResourceNoteUIModel[] => [
  {
    note_id: `${recResourceId}-1`,
    rec_resource_id: recResourceId,
    note_type: 'NOTE',
    title: 'Access road washout after spring melt',
    body: '<p>The last 2km of the access road washed out during the spring melt. Grading is scheduled but the site should be treated as 4WD only until it is confirmed complete.</p>',
    date_logged: '2026-04-18',
    created_by: 'Sarah Johnson',
  },
  {
    note_id: `${recResourceId}-2`,
    rec_resource_id: recResourceId,
    note_type: 'NOTE',
    title: 'Tenure overlap with grazing licence',
    body: '<p>Portions of the site overlap an active grazing licence. Coordinate any footprint changes with the range officer before approving work.</p>',
    date_logged: '2026-02-02',
    created_by: 'Michael Chen',
  },
  {
    note_id: `${recResourceId}-3`,
    rec_resource_id: recResourceId,
    note_type: 'NOTE',
    title: 'Signed partnership agreement 2025',
    body: '<p>Agreement covering day-to-day maintenance is on file with the district office. Renewal is due in the fall.</p>',
    date_logged: '2025-11-26',
    created_by: 'Sarah Johnson',
  },
];

/** Notes keyed by rec resource id, seeded the first time a resource is read. */
const notesByResource = new Map<string, RecreationResourceNoteUIModel[]>();

const getResourceNotes = (recResourceId: string) => {
  if (!notesByResource.has(recResourceId)) {
    notesByResource.set(recResourceId, seedNotes(recResourceId));
  }
  return notesByResource.get(recResourceId)!;
};

/** Newest first, which is the ordering the list view expects. */
const byDateLoggedDesc = (
  a: RecreationResourceNoteUIModel,
  b: RecreationResourceNoteUIModel,
) => b.date_logged.localeCompare(a.date_logged);

export interface CreateNotePayload {
  note_type: RecreationResourceNoteType;
  title: string;
  body: string;
  created_by: string;
}

export interface UpdateNotePayload {
  title: string;
  body: string;
}

let nextId = 1000;

export const mockNotesApi = {
  async list(recResourceId: string): Promise<RecreationResourceNoteUIModel[]> {
    await delay();
    return [...getResourceNotes(recResourceId)].sort(byDateLoggedDesc);
  },

  async create(
    recResourceId: string,
    payload: CreateNotePayload,
  ): Promise<RecreationResourceNoteUIModel> {
    await delay();
    const note: RecreationResourceNoteUIModel = {
      note_id: `${recResourceId}-${nextId++}`,
      rec_resource_id: recResourceId,
      // The server stamps this on insert, so the client never sends it.
      date_logged: new Date().toISOString().slice(0, 10),
      ...payload,
    };
    getResourceNotes(recResourceId).push(note);
    return note;
  },

  async update(
    recResourceId: string,
    noteId: string,
    payload: UpdateNotePayload,
  ): Promise<RecreationResourceNoteUIModel> {
    await delay();
    const notes = getResourceNotes(recResourceId);
    const existing = notes.find((note) => note.note_id === noteId);
    if (!existing) {
      throw new Error(`Note ${noteId} not found`);
    }
    Object.assign(existing, payload);
    return existing;
  },

  async remove(recResourceId: string, noteId: string): Promise<void> {
    await delay();
    const notes = getResourceNotes(recResourceId);
    const index = notes.findIndex((note) => note.note_id === noteId);
    if (index === -1) {
      throw new Error(`Note ${noteId} not found`);
    }
    notes.splice(index, 1);
  },
};
