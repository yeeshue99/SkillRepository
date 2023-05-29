const supabaseImport = require('@supabase/supabase-js');
const { schedule } = require("@netlify/functions");

const handler = async function (event, context) {
    // let supabase = supabaseImport.createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)
    let supabase = supabaseImport.createClient("https://xerzbigpkpuflykmhifk.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlcnpiaWdwa3B1Zmx5a21oaWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA5ODk0ODgsImV4cCI6MTk5NjU2NTQ4OH0.w2w_81h4HgUFsrKp-abcE4deUzuem9UJvDQ53vKWmE8")


    const skills = await supabase.from('Skills').select().order('name', { ascending: true })

    console.log(skills.data[0]);

    return {
        statusCode: 200,
        body: JSON.stringify(skills.data),
    };
};

exports.handler = schedule("@hourly", handler);