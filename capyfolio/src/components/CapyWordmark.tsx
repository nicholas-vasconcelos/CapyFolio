import capyMascot from '../assets/capy-mascot.png';
import capyWordmark from '../assets/capyfolio-wordmark.png';

// The wordmark image is for light grounds only: its navy "Capy" disappears on navy, so onNavy falls back to
// live text. The mascot must not sit directly on navy either: pass showMascot={false} there and use a MascotDisc.
export function CapyWordmark({ showMascot = true, size = 'md', onNavy = false }: { showMascot?: boolean; size?: 'sm' | 'md' | 'lg'; onNavy?: boolean }) {
  const mascotSize = size === 'lg' ? 'h-[50px] w-11' : 'h-[41px] w-9';

  if (onNavy) {
    const textSize = size === 'lg' ? 'text-[30px]' : size === 'sm' ? 'text-[21px]' : 'text-[25px]';
    return (
      <b className={`select-none font-display font-extrabold leading-none tracking-[-0.02em] text-on-navy ${textSize}`}>
        Capy<span className="text-gold">Folio</span>
      </b>
    );
  }

  const wordmarkSize = size === 'lg' ? 'h-12' : size === 'sm' ? 'h-8' : 'h-10';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {showMascot && <img src={capyMascot} alt="" className={`${mascotSize} object-contain`} />}
      <img src={capyWordmark} alt="CapyFolio" className={`${wordmarkSize} w-auto`} />
    </div>
  );
}
