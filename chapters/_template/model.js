// Pure maths/physics. NO three.js here, so it is easy to check and unit-test.
export const supportsReal=false;            // true → engine shows an Ideal/Real switch; lab.mode = 'ideal' | 'real'
export const realNote='what "real" adds';
export const defaults={a:1,on:false};      // every slider/toggle key lives here
export const position=(p,t)=>p.a*Math.sin(t);
/** Values shown in the console readouts (refreshed ~8×/s). Optional `note` string. */
export function readouts(p,mode){return{x:p.a,note:''}}
