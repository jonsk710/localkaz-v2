export default function GuadeloupeBlankSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="w-full h-auto select-none pointer-events-none">
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3dd6a2"/>
          <stop offset="1" stopColor="#29b48a"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity=".18"/>
        </filter>
        <style>{`.island{fill:url(#g);stroke:#0b6b5a;stroke-width:2.5;filter:url(#shadow)}`}</style>
      </defs>
      <path className="island" d="M330,590 C240,540 230,450 260,380 C290,315 350,270 420,260 C500,250 560,280 600,340 C635,392 635,450 600,510 C560,575 500,615 430,620 C395,622 360,610 330,590Z"/>
      <path className="island" d="M650,520 C610,470 610,420 640,380 C690,315 770,290 855,300 C930,308 995,345 1030,400 C1065,455 1040,520 975,555 C910,592 830,600 760,575 C710,557 675,545 650,520Z"/>
      <path className="island" d="M1080,375 C1115,370 1145,370 1170,380 C1140,400 1110,405 1080,395Z"/>
      <path className="island" d="M900,700 C850,735 780,735 745,690 C710,645 730,585 785,565 C840,545 905,570 920,620 C930,653 925,680 900,700Z"/>
      <path className="island" d="M520,720 C505,705 505,680 525,670 C555,655 585,675 585,700 C585,725 550,740 520,720Z"/>
      <path className="island" d="M590,750 C580,740 585,725 600,720 C620,715 640,730 635,745 C630,760 605,762 590,750Z"/>
      <path className="island" d="M990,420 C980,415 980,405 995,402 C1010,400 1020,410 1012,418 C1005,425 995,425 990,420Z"/>
    </svg>
  );
}
