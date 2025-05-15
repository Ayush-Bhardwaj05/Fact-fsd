import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qdawjlmdtpmnwvpgxcba.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkYXdqbG1kdHBtbnd2cGd4Y2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMjU4NTksImV4cCI6MjA2MjgwMTg1OX0._h5jIcz56pD8F-qMBbYb35AMlzZR5AAYPaCVD6-Pu4M";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;