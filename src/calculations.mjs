import {text} from './content.mjs';
// These calculators read stems only. They are arithmetic corroboration, never write authority.
export function calculations(q){
 const stem=text(q[q.questionType].question).split(/\(A\)/)[0],facts=[];
 const side=/Each side of a cube is measured to be\s*(\d+\.\d+)\s*m/i.exec(stem),scale=/value of\s*(\d+)\s*A/i.exec(stem);
 if(side&&scale&&/correct significant digits/i.test(stem)){
  const digits=side[1].replace('.','').replace(/^0+/,'').length,exact=6*Number(side[1])**2,rounded=Number(exact.toPrecision(digits)),value=rounded*Number(scale[1]);
  facts.push({check:'cube_surface_area_significant_figures',value,unit:'requested numerical form',summary:`6 × ${side[1]}² = ${exact}. Round the final area to ${digits} significant figures: ${rounded} m²; ${scale[1]}A = ${value}. Do not round intermediate products.`});
 }
 const rho=/density of a gas is\s*(\d+(?:\.\d+)?)\s*[×x]\s*10\s*[−-]\s*(\d+)/i.exec(stem),speed=/velocity of gas molecules is\s*(\d+(?:\.\d+)?)/i.exec(stem);
 if(rho&&speed){const density=Number(rho[1])*10**(-Number(rho[2])),v=Number(speed[1]),value=density*v*v/3;facts.push({check:'kinetic_gas_pressure',value,unit:'Pa',summary:`P = ρ v_rms² / 3 = ${density} × ${v}² / 3 = ${value} Pa.`});}
 const lcr=/inductance is\s*(\d+(?:\.\d+)?)\s*V.*?capacitor is\s*(\d+(?:\.\d+)?)\s*V.*?resistance is\s*(\d+(?:\.\d+)?)\s*V/i.exec(stem);
 if(lcr&&/LCR circuit/i.test(stem)){const [,vl,vc,vr]=lcr.map(Number),value=Math.hypot(vr,vl-vc);facts.push({check:'lcr_supply_voltage',value,unit:'V',summary:`V = √(${vr}² + (${vl} − ${vc})²) = ${value} V.`});}
 const mass=/a\s*(\d+(?:\.\d+)?)\s*g mass/i.exec(stem),height=/cube is\s*(\d+(?:\.\d+)?)\s*cm above/i.exec(stem);
 if(mass&&height&&/wooden cube.*water/i.test(stem)){const value=Math.sqrt(Number(mass[1])/Number(height[1]));facts.push({check:'floating_cube_side',value,unit:'cm',summary:`Water density is 1 g/cm³, so ${height[1]} a² = ${mass[1]} and a = ${value} cm. Gravity cancels.`});}
 return facts;
}
