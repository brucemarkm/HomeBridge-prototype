"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  Check,
  Sparkles,
  Users,
  ShieldCheck,
  Plus,
  House,
} from "lucide-react";
import { State, Property, photo, money, properties } from "../lib/model";
type Props = {
  state: State;
  query: string;
  setQuery: (value: string) => void;
  search: (value: string) => void;
  setModal: (value: string) => void;
  card: (p: Property) => React.ReactNode;
};
export default function Homepage({
  state,
  query,
  setQuery,
  search,
  setModal,
  card,
}: Props) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="dot" /> A SMARTER, SIMPLER WAY HOME
          </span>
          <h1>
            Your home.
            <br />A smarter <em>way.</em>
          </h1>
          <p>
            Find a place you love. Get guidance you can trust.
            <br className="desktop-only" /> And move forward with a little more
            confidence.
          </p>
          <div className="row hero-actions">
            <Link href="/homes" className="btn primary">
              Find your home <ArrowUpRight size={19} />
            </Link>
            <Link href="/how-it-works" className="text-link">
              See how it works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-proof">
            <div className="mini-avatars">
              <span>JE</span>
              <span>CB</span>
              <span>AM</span>
            </div>
            <div>
              <strong>Technology that guides. People who care.</strong>
              <small>A new approach to the homebuying journey.</small>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img
            src={photo(0)}
            alt="Sunlit contemporary home with warm wood details and welcoming outdoor spaces"
          />
          <span className="hero-image-label">
            A LITTLE INSPIRATION FOR YOUR NEXT CHAPTER · AI ILLUSTRATION
          </span>
          <div className="floating-card">
            <div className="row">
              <span className="check-icon">
                <Check size={18} />
              </span>
              <div>
                <span className="eyebrow">
                  LESS COMPLEXITY. MORE POSSIBILITY.
                </span>
                <h3>Full support. One clear fee.</h3>
              </div>
            </div>
            <div className="row between">
              <strong>
                {money(state.fee)}
                <small> proposed flat fee</small>
              </strong>
              <Link href="/pricing" aria-label="Explore pricing">
                <ArrowUpRight size={20} />
              </Link>
            </div>
          </div>
          <div className="visual-number">01 / A place to begin</div>
        </div>
      </section>
      <section className="search-strip">
        <div>
          <span className="eyebrow">LET’S FIND YOUR KIND OF HOME</span>
          <h3>What does home look like to you?</h3>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
        >
          <Search size={20} />
          <input
            aria-label="Describe your dream home"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="3 bedrooms in Provo under $550,000…"
          />
          <button className="btn primary">
            Explore <ArrowRight size={17} />
          </button>
        </form>
      </section>
      <section className="section-wrap featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ROOM FOR YOUR NEXT CHAPTER</span>
            <h2>Good places. Great possibilities.</h2>
            <p>A few favorites from our fictional Utah County collection.</p>
          </div>
          <Link className="text-link" href="/homes">
            Explore all homes <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="property-grid">{properties.slice(0, 3).map(card)}</div>
        <p className="caption">
          DEMO COLLECTION · All listings and addresses are fictional. Images are
          illustrative AI-generated architectural illustrations.
        </p>
      </section>
      <section className="advantage section-wrap">
        <div>
          <span className="eyebrow">A BETTER WAY FORWARD</span>
          <h2>
            A big life moment.
            <br />A simpler experience.
          </h2>
          <p>
            You bring the vision. We bring clarity to the steps between finding
            your home and getting the keys.
          </p>
          <Link className="text-link" href="/about">
            Meet Homebridge <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="advantage-items">
          {[
            [
              Sparkles,
              "A little intelligence. A lot of clarity.",
              "Explore homes, compare your options, and make sense of the details with our demo guide.",
            ],
            [
              Users,
              "Real people for the real decisions.",
              "A professional-led model designed for the moments that need experience, care, and a human conversation.",
            ],
            [
              ShieldCheck,
              "Less guesswork. More transparency.",
              "One proposed flat fee and a clear view of your progress, tasks, and next steps.",
            ],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Sparkles;
            return (
              <div key={String(title)}>
                <I size={24} />
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="section-wrap">
        <div className="import-banner">
          <div>
            <span className="eyebrow">YOUR SEARCH CAN START ANYWHERE</span>
            <h2>Already found a home?</h2>
            <p>Bring it into Homebridge. We’ll help you see what’s next.</p>
            <button className="btn primary" onClick={() => setModal("import")}>
              Bring your home <Plus size={17} />
            </button>
          </div>
          <div className="import-art">
            <House size={54} strokeWidth={1} />
            <span>One home. One organized journey.</span>
            <div className="art-line" />
          </div>
        </div>
      </section>
      <section className="section-wrap">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FROM FIRST LOOK TO FRONT DOOR</span>
            <h2>Your path home, made clearer.</h2>
          </div>
          <Link href="/get-started" className="text-link">
            Start your journey <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="three-cols">
          {[
            [
              "01",
              "Find your place",
              "Explore the demo collection or bring a property you’ve already found.",
            ],
            [
              "02",
              "Know your next step",
              "Compare options, explore the numbers, and organize your questions.",
            ],
            [
              "03",
              "Move forward together",
              "Follow a simulated purchase with a demo professional by your side.",
            ],
          ].map(([n, t, d]) => (
            <div className="step-card" key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section-wrap">
        <div className="demo-banner">
          <span className="eyebrow">TAKE A LOOK AROUND</span>
          <h2>
            A homebuying journey.
            <br />
            Ready for you to explore.
          </h2>
          <p>
            Meet your demo agent. Save a few homes. See every step come
            together.
          </p>
          <button className="btn cream" onClick={() => setModal("demo")}>
            Explore the demo <ArrowUpRight size={18} />
          </button>
        </div>
      </section>
      <section className="faq section-wrap">
        <div>
          <span className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</span>
          <h2>
            Good questions.
            <br />
            Straight answers.
          </h2>
        </div>
        <div>
          {[
            [
              "Is Homebridge a real brokerage?",
              "Homebridge is a demonstration concept, not an operating brokerage. No professional relationship is created and no actual offers, tours, or transactions take place.",
            ],
            [
              "Are these homes really for sale?",
              "No. Our addresses, prices, property details, and transactions are fictional. Generated illustrations are for inspiration and do not depict the fictional addresses.",
            ],
            [
              "How does the flat fee work?",
              "The proposed buyer representation fee is $2,995 per completed transaction. Real pricing and services would require an operating licensed brokerage. Fee differences are not automatically buyer cash savings.",
            ],
            [
              "Do I need an account or API key?",
              "No. Enter a demo role and explore. Changes stay in this browser. The assistant uses local scripted responses and no paid services.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
