// Content: text, guided steps, NCERT mapping, quiz. No code beyond data.
export default {
  slug:'projectile-motion', title:'Projectile Motion', subject:'physics', class:11, stage:'paper',
  ncert:{chapter:3,chapterTitle:'Motion in a Plane',section:'3.9',ref:'NCERT Physics XI · Ch 3 Motion in a Plane · §3.9 Projectile motion (p. 38)'},
  question:'Why does every thrown ball follow the same kind of curve?',
  steps:[
    {id:'launch',title:'Launch a ball',shot:'overview',set:{u:20,th:45,h:0,cmp:false},mode:'ideal',auto:'fire',
     question:'What shape is the path of a ball thrown at an angle?',action:'Press ▶ Fire. Drag the view to look from the side.',
     expected:'A symmetric arch: it rises, slows, and falls back to the page.',conclusion:'Once released, only gravity acts (air resistance neglected). The path is a parabola: $y=x\\tan\\theta-\\dfrac{g x^2}{2u^2\\cos^2\\theta}$.'},
    {id:'components',title:'Two motions in one',shot:'side',layers:['cannon','path','vectors','ball'],focus:['u','th'],auto:'fire',
     question:'How do the horizontal and vertical parts of the velocity change during flight?',action:'Fire again and watch the blue $v_x$ and green $v_y$ arrows. Try Slow-mo.',
     expected:'$v_x$ never changes length; $v_y$ shrinks, flips, then grows downward.',conclusion:'Horizontal: no force, so $v_x=u\\cos\\theta$ is constant. Vertical: constant acceleration $-g$, so $v_y=u\\sin\\theta-gt$. The two are independent (Galileo).'},
    {id:'top',title:'At the very top',shot:'top',set:{slow:true},auto:'fire',
     question:'Is the ball ever at rest during its flight?',action:'Fire in slow motion and pause (▶ button) near the highest point H.',
     expected:'At the top only the blue $v_x$ arrow remains.',conclusion:'At $H$, $v_y=0$ but $v=u\\cos\\theta\\neq0$. Time to the top is $t_m=u\\sin\\theta/g$, half the total time of flight.'},
    {id:'range45',title:'Best angle for range',shot:'overview',set:{slow:false,th:30},focus:['th'],
     question:'Which launch angle sends the ball farthest on level ground?',action:'Drag θ from 15° to 75° and watch the R readout. Fire at a few angles.',
     expected:'R peaks at θ = 45°.',conclusion:'$R=u^2\\sin2\\theta/g$ is largest when $\\sin2\\theta=1$, i.e. $\\theta=45^\\circ$, giving $R_{max}=u^2/g$.'},
    {id:'complement',title:'Complementary angles',shot:'wide',set:{th:30,cmp:true},layers:['cannon','path','compare','marks','ball','vectors'],auto:'fire',focus:['th'],
     question:'Can two different angles give the same range?',action:'With "θ vs 90°−θ" on, fire. Change θ and compare the two paths.',
     expected:'30° and 60° land at the same point; 60° goes higher and stays up longer.',conclusion:'$\\sin2\\theta=\\sin(180^\\circ-2\\theta)$, so θ and 90°−θ give equal ranges (when h = 0) but different H and T.'},
    {id:'height',title:'Launch from a cliff',shot:'cliff',set:{cmp:false,th:30,h:20},focus:['h'],auto:'fire',
     question:'What changes if the ball is launched from a height h?',action:'Set h with the slider and fire. Try θ = 0° style low angles (5°).',
     expected:'T and R grow; the best angle drops below 45°.',conclusion:'Now $h+u_yt-\\tfrac12gt^2=0$ gives $T=\\dfrac{u\\sin\\theta+\\sqrt{u^2\\sin^2\\theta+2gh}}{g}$. Thrown horizontally, $t=\\sqrt{2h/g}$ whatever u is.'},
    {id:'real',title:'Real vs ideal',shot:'overview',set:{h:0,th:45,u:30},mode:'real',layers:['cannon','path','ideal','marks','ball','vectors'],auto:'fire',focus:['u'],
     question:'Why does a real cricket ball land short of the textbook range?',action:'Switch between Ideal and Real. Raise u and watch ΔR.',
     expected:'With drag the path is lopsided (steeper fall) and R drops; the faster the throw, the bigger the loss.',conclusion:'Drag $\\propto v^2$ removes energy, so NCERT says "air resistance is neglected". Real readings also carry instrument rounding — a good talking point for practical exams.'}],
  quiz:[
    {q:"At the top of its flight, a projectile's velocity is…",options:['zero','horizontal','vertical','maximum'],answer:1,why:'$v_y=0$ there, only $v_x=u\\cos\\theta$ remains.'},
    {q:'Range on level ground is maximum when θ equals…',options:['30°','45°','60°','90°'],answer:1,why:'$\\sin2\\theta=1$ at 45°.'},
    {q:'Which angle gives the same range as 30°?',options:['45°','50°','60°','75°'],answer:2,why:'Complementary: 90° − 30° = 60°.'},
    {q:'A ball rolls off a 4.9 m table at 3 m/s. Time to land (g = 9.8 m/s²)?',options:['0.5 s','1.0 s','1.6 s','3.0 s'],answer:1,why:'$t=\\sqrt{2h/g}=1$ s, independent of horizontal speed.'},
    {q:'If u is doubled (same θ), the range becomes…',options:['same','2×','4×','½×'],answer:2,why:'$R\\propto u^2$.'}]
};
