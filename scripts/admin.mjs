// Manages back-office access with the service role key from .env.
//   npm run admin -- add someone@example.com
//   npm run admin -- remove someone@example.com
//   npm run admin -- list
// The person must have created an account on the site first.
import { createClient } from "@supabase/supabase-js";

// Messages for the person running the script, as opposed to unexpected failures.
class UsageError extends Error {}

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new UsageError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (see .env).");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const allUsers = async () => {
    const users = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < 1000) return users;
    }
  };

  const findUser = async (email) => {
    const user = (await allUsers()).find((candidate) => candidate.email?.toLowerCase() === email);
    if (!user) throw new UsageError(`No account for ${email}. Sign up on the site first, then run this again.`);
    return user;
  };

  const [command, rawEmail] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();

  if (command === "list") {
    const { data, error } = await supabase.from("admins").select("user_id, created_at");
    if (error) throw error;
    const emails = new Map((await allUsers()).map((user) => [user.id, user.email]));
    if (data.length === 0) console.log("No admins yet.");
    for (const row of data) console.log(`${emails.get(row.user_id) ?? row.user_id}  (since ${row.created_at.slice(0, 10)})`);
  } else if (command === "add" && email) {
    const user = await findUser(email);
    const { error } = await supabase.from("admins").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
    if (error) throw error;
    console.log(`${email} is now an admin. Open /admin on the site.`);
  } else if (command === "remove" && email) {
    const user = await findUser(email);
    const { error } = await supabase.from("admins").delete().eq("user_id", user.id);
    if (error) throw error;
    console.log(`${email} no longer has admin access.`);
  } else {
    throw new UsageError("Usage: npm run admin -- add <email> | remove <email> | list");
  }
}

// Set the exit code instead of calling process.exit(), which crashes Node on Windows
// while fetch connections are still closing.
main().catch((error) => {
  console.error(error instanceof UsageError ? error.message : error);
  process.exitCode = 1;
});
