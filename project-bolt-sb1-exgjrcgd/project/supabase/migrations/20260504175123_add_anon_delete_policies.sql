/*
  # Add DELETE policies for anonymous users

  ## Problem
  The admin panel uses the anon Supabase client (no auth). The existing RLS policies
  for anon only allow INSERT, SELECT, and UPDATE — not DELETE. This prevents the admin
  from deleting appointments, packages, clients, and pets.

  ## Changes
  - Add DELETE policy for anon role on: appointments, packages, clients, pets
*/

CREATE POLICY "Anon can delete appointments"
  ON appointments FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Anon can delete packages"
  ON packages FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Anon can delete clients"
  ON clients FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Anon can delete pets"
  ON pets FOR DELETE
  TO anon
  USING (true);
