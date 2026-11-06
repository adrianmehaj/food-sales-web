import { Link } from 'react-router-dom';
import { Check, MapPin, PackageCheck, ShoppingBag, Truck } from 'lucide-react';
import { useResource } from '../../shared/api';
import type { Business } from '../../shared/types';
import { ErrorBox } from '../../shared/ui';

export function HowItWorks() {
  const business = useResource<Business>('/catalog/business');
  return <div className="wrap reading-page"><span className="eyebrow">LEHTË, NGA FILLIMI NË FUND</span><h1>Ju zgjidhni.<br /><em>Ne e sjellim.</em></h1><p className="lead">Porositni nga telefoni ose kompjuteri, me ose pa llogari.</p><div className="steps-grid">{[{ icon: ShoppingBag, title: '01. Mbushni shportën', text: 'Zgjidhni produktet dhe sasitë. Për djathin dhe produktet me peshë, totali përshtatet me peshën reale.' }, { icon: Truck, title: '02. Zgjidhni mënyrën', text: 'Dërgesë falas në adresë ose marrje vetë. Për qytetet jashtë Skenderajt ju kontaktojmë për të konfirmuar mundësinë dhe kohën.' }, { icon: PackageCheck, title: '03. Prisni konfirmimin', text: 'Ne konfirmojmë porosinë dhe e përgatisim. Për marrje vetë, prisni konfirmimin se porosia është gati.' }].map(step => <article className="panel" key={step.title}><step.icon size={27} /><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><div className="panel pickup-panel"><MapPin size={26} /><div><h2>Marrja vetë</h2><p>{business.data?.pickupAddress ?? 'Lokacioni do të konfirmohet nga biznesi.'}</p>{business.data?.phone && <a href={'tel:' + business.data.phone}>{business.data.phone}</a>}{business.data?.mapUrl && <a href={business.data.mapUrl} rel="noopener noreferrer" target="_blank">Hap hartën</a>}</div></div><ErrorBox message={business.error} retry={business.reload} /><p className="inline-note"><Check size={18} /> Pagesat dhe çdo borxh regjistrohen veçmas. Blerja me borxh kërkon miratimin e adminit.</p><Link className="button primary" to="/">Shiko produktet</Link></div>;
}
