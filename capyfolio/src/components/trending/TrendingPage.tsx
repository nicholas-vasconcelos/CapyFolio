import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { searchHref, type SearchKind } from '../../lib/searchConfigs';
import { CARD_GRID, type CardSize } from '../search/cardGrid';
import { EmptyState } from '../search/EmptyState';

export interface TrendingSection {
  key: string;
  title: string;
  description: string;
  cards: React.ReactNode[];
}


/**
 * Landing page for Projetos, Pessoas and Eventos: what is popular or current now, plus a search
 * field and a "search everything" call to action that open Busca limited to this type.
 */
export function TrendingPage({ kind, eyebrow, title, subtitle, searchLabel, placeholder, sections, searchAllLabel, searchAllText, cardSize, loading = false }: {
  kind: SearchKind;
  eyebrow: string;
  title: string;
  subtitle: string;
  searchLabel: string;
  placeholder: string;
  sections: TrendingSection[];
  /** CTA button text, e.g. "Buscar todos os 12 projetos". */
  searchAllLabel: string;
  searchAllText: string;
  cardSize: CardSize;
  loading?: boolean;
}) {
  const navigate = useNavigate();
  const inputId = useId();
  const [text, setText] = useState('');
  const visible = sections.filter((section) => section.cards.length > 0);

  return (
    <div className="bg-paper">
      <section className="capy-hero-shell">
        <div className="mx-auto flex max-w-[1344px] flex-col gap-7 px-4 pb-16 pt-10 sm:px-6 md:px-12 md:pt-14">
          <div className="flex flex-col gap-3">
            <span className="text-[17px] font-semibold text-gold-light">{eyebrow}</span>
            <h1 className="m-0 max-w-[15em] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-navy [text-wrap:balance] md:text-[56px] lg:text-[68px]">{title}</h1>
            <p className="m-0 max-w-[56ch] text-lg leading-normal text-on-navy-muted md:text-[19px]">{subtitle}</p>
          </div>
          <form role="search" onSubmit={(event) => { event.preventDefault(); navigate(searchHref(kind, text)); }} className="flex w-full max-w-[820px] flex-wrap gap-3.5">
            <label htmlFor={inputId} className="sr-only">{searchLabel}</label>
            <div className="cf-search hero min-w-0 flex-[1_1_320px] focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-[3px] focus-within:outline-focus">
              <Search className="h-6 w-6 flex-none text-ink-muted" aria-hidden="true" />
              <input id={inputId} type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} autoComplete="off" />
            </div>
            <button type="submit" className="cf-btn cta lg on-navy-cta">Buscar</button>
          </form>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1344px] flex-col gap-14 px-4 pb-[88px] pt-10 sm:px-6 md:px-12 md:pt-14">
        {loading ? (
          <p role="status" className="m-0 text-ink-muted">Carregando…</p>
        ) : visible.length === 0 ? (
          <EmptyState title="Nada por aqui ainda" text="Assim que houver conteúdo publicado, os destaques aparecem nesta página." />
        ) : (
          visible.map((section) => (
            <section key={section.key} aria-labelledby={`${kind}-${section.key}`} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h2 id={`${kind}-${section.key}`} className="m-0 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-navy md:text-[34px]">{section.title}</h2>
                <p className="m-0 text-base text-ink-muted">{section.description}</p>
              </div>
              <div className={`grid gap-6 ${CARD_GRID[cardSize]}`}>{section.cards}</div>
            </section>
          ))
        )}

        {!loading && (
          <div className="cf-card gold flex-row flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1.5">
              <h3>Procurando algo específico?</h3>
              <p>{searchAllText}</p>
            </div>
            <Link to={searchHref(kind)} className="cf-btn primary">
              {searchAllLabel}
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
