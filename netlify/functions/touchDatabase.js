const supabaseImport = require('@supabase/supabase-js');
const { schedule } = require("@netlify/functions");

const handler = async function (event, context) {
    let supabase = supabaseImport.createClient(process.env.REACT_APP_DATABASE_URL, process.env.REACT_APP_DATABASE_API_KEY)


    const skills = await supabase.from('Skills').select().order('name', { ascending: true })

    console.log(skills.data[0]);

    return {
        statusCode: 200,
        body: JSON.stringify(skills.data),
    };
};

exports.handler = schedule("@daily", handler);