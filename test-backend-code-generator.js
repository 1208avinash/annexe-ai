import { runBackendCodeGenerator } from "./api/generation/backend/generator.js";


console.log(`
════════════════════════════════════
 ANNEXE AI Backend Code Generator Test
════════════════════════════════════
`);


const backendPlan = {

 framework:"FastAPI",

 services:[
   "Auth Service",
   "CRM Service",
   "Lead Service"
 ],

 apis:[
   "GET /health",
   "POST /login",
   "GET /leads"
 ],

 authentication:[
   "JWT Authentication"
 ],

 securityTasks:[
   "Input validation"
 ]

};



const result = runBackendCodeGenerator({
 backendPlan
});


console.log(result);



let passed = 0;
let failed = 0;


function check(name,value){

 if(value){
   console.log("✅",name);
   passed++;
 }
 else{
   console.log("❌",name);
   failed++;
 }

}



check(
 "generator success",
 result.success === true
);


check(
 "files array exists",
 Array.isArray(result.files)
);


check(
 "main.py generated",
 result.files.some(
  f=>f.path==="api/main.py"
 )
);


check(
 "services generated",
 result.files.some(
  f=>f.path.includes("services/")
 )
);


check(
 "routes generated",
 result.files.some(
  f=>f.path==="api/routes.py"
 )
);



console.log(`
════════════════════════════════════
 ${passed} passed, ${failed} failed
════════════════════════════════════
`);



if(failed>0){
 process.exit(1);
}