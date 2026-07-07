import { createClient } from "@supabase/supabase-js";

const supabase = createClient(

process.env.SUPABASE_URL,

process.env.SUPABASE_SERVICE_ROLE_KEY

);

async function run(){

console.log("Seeding database...");

const categories=[

"Desk Organizers",

"Laptop Stands",

"Cable Management",

"Phone Holders",

"Accessories"

];

for(const name of categories){

await supabase

.from("categories")

.insert({name});

}

console.log("Finished.");

}

run();
