import { json } from '@sveltejs/kit';
import { getMasters } from '$lib/server/getMasters.js';

export async function GET({ request }) {
  try {
    const masters = await getMasters();
    return json({ error: 0, masters });
  } catch (err) {
    return json({ error: -1, errorMsg: err.message }, { status: 500 });
  }
}