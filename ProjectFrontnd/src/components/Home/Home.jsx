import { useMemo, useState } from "react";
import "./Home.css";

const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const bedRooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const bathRooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const styles = ["Modern luxury", "Modern", "Traditional", "Minimal", "Luxury villa"];
// const parkingOptions = ["None", "1 car", "2 cars"];
const kitchenTypes = ["Open", "Closed"];
const extrasList = ["Balcony", "Pooja room", "Home office", "Garden", "Terrace seating", "Lift space"];

export default function Home() {
  const userId = localStorage.getItem("hp_user_id") || crypto.randomUUID();
  localStorage.setItem("hp_user_id", userId);

  const [plot, setPlot] = useState("30x40");
  const [Nfloors, setNfloors] = useState(2);
  const [NbedRooms, setNbedRooms] = useState(4);
  const [NbathRooms, setNbathRooms] = useState(4);

  const [style, setStyle] = useState("Modern luxury");
  const [parking, setParking] = useState("1 car 2 bikes");
  const [kitchen, setKitchen] = useState("Open");

  const [extras, setExtras] = useState(["Balcony", "Pooja room"]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const prompt = useMemo(() => {
    const extraText = extras.length?extras.join(", "):"None";
    return (
      `Plot: ${plot} ft\n` +
      `Floors: ${Nfloors}\n` +
      `Bedrooms: ${NbedRooms}\n` +
      `Bathrooms: ${NbathRooms}\n` +
      `Style: ${style}\n` +
      `Parking: ${parking}\n` +
      `Kitchen: ${kitchen}\n` +
      `Extras: ${extraText}`
    );
  }, [plot, Nfloors, NbedRooms, NbathRooms, style, parking, kitchen, extras]);

  const toggleExtra = (name) => {
    setExtras((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  const formatOutput = (text) => {
    if (!text) return { overview: "", ground: "", first: "", features: "" };

    let cleaned = text.replace(/\*\*/g, "").replace(/---/g, "").trim();
    const lower = cleaned.toLowerCase();

    const getIndex = (keywords) => {
      for (const k of keywords) {
        const idx = lower.indexOf(k);
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const iGround = getIndex(["ground floor plan", "ground floor"]);
    const iFirst = getIndex(["first floor plan", "first floor"]);
    const iFeatures = getIndex(["key features", "luxury features", "features"]);

    const cut = (start, end) => {
      if (start < 0) return "";
      if (end < 0) return cleaned.slice(start).trim();
      return cleaned.slice(start, end).trim();
    };

    const overview =
      iGround > 0 ? cleaned.slice(0, iGround).trim() : cleaned.slice(0, 500).trim();
    const ground = cut(iGround, iFirst > 0 ? iFirst : iFeatures);
    const first = cut(iFirst, iFeatures);
    const features = cut(iFeatures, -1);

    return {
      overview: overview || "Overview not detected.",
      ground: ground || "Ground floor section not detected.",
      first: first || "First floor section not detected.",
      features: features || "Features section not detected.",
    };
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied ");
    } catch {
      alert("Copy failed ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!plot.trim()) {
      alert("Please enter plot size ");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const res = await fetch("https://homeplanner-backend.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ prompt, user_id: userId }),
      });

          if (!res.ok) {
      const err = await res.json();
      setResult(`❌ ${err.detail}`);
      return;
    }

      const data = await res.json();
      setResult(data?.response || "No response received.");
    } catch (err) {
      console.log(err);
      setResult("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => formatOutput(result), [result]);

  return (
    <div className="hp">
      <header className="hp__header">
        <div>
          <h1 className="hp__title">Home Planner</h1>
          <p className="hp__subtitle">Enter details . Generate a luxury home plan </p>
        </div>
      </header>

      <main className="hp__main">
        <section className="card">
          <div className="card__head">
            <h2 className="card__title">Home Inputs</h2>
            <p className="card__hint">Minimal inputs, best results </p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Plot size (ft)</label>
              <input
                className="input"
                type="text"
                value={plot}
                onChange={(e) => setPlot(e.target.value)}
              />
            </div>
            <div className="grid">
              <div className="field">
                <label className="label">Floors</label>
                <select
                  className="select"
                  value={Nfloors}
                  onChange={(e) => setNfloors(Number(e.target.value))}
                >
                  {floors.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Bedrooms</label>
                <select
                  className="select"
                  value={NbedRooms}
                  onChange={(e) => setNbedRooms(Number(e.target.value))}
                >
                  {bedRooms.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Bathrooms</label>
                <select
                  className="select"
                  value={NbathRooms}
                  onChange={(e) => setNbathRooms(Number(e.target.value))}
                >
                  {bathRooms.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Parking</label>
                <input type="text"
                className="select"
                value={parking}
                placeholder="1 car 2 bikes"
                onChange={(e)=>setParking(e.target.value)}/>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <label className="label">Style</label>
                <select className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
                  {styles.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Kitchen</label>
                <select className="select" value={kitchen} onChange={(e) => setKitchen(e.target.value)}>
                  {kitchenTypes.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label">Extras</label>
              <div className="chips">
                {extrasList.map((x) => (
                  <button
                    type="button"
                    key={x}
                    className={extras.includes(x) ? "chip chip--active" : "chip"}
                    onClick={() => toggleExtra(x)}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <div className="row">
                <label className="label">Prompt Preview</label>
                <button type="button" className="miniBtn" onClick={() => copyText(prompt)}>
                  Copy
                </button>
              </div>
              <pre className="preview">{prompt}</pre>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </form>
        </section>

        <section className="card card--output">
          <div className="card__head">
            <h2 className="card__title">Generated Output</h2>
            <p className="card__hint">Powered by gemini</p>
          </div>

          <div className="output">
            {!result && !loading && (
              <div className="output__empty">
                <img src="icon.png" alt="" />
                <p className="output__text">
                  Fill inputs and click <b>Generate Plan</b>
                </p>
              </div>
            )}

            {loading && (
              <div className="output__loading">
                <div className="spinner" />
                <p>Generating plan using Gemini...</p>
              </div>
            )}

            {!loading && result && (
              <div className="outputBlocks">
                <div className="block">
                  <div className="blockTop">
                    <h3>HOME OVERVIEW</h3>
                    <button className="miniBtn" onClick={() => copyText(sections.overview)}>Copy</button>
                  </div>
                  <pre>{sections.overview}</pre>
                </div>

                <div className="block">
                  <div className="blockTop">
                    <h3>GROUND FLOOR</h3>
                    <button className="miniBtn" onClick={() => copyText(sections.ground)}>Copy</button>
                  </div>
                  <pre>{sections.ground}</pre>
                </div>

                <div className="block">
                  <div className="blockTop">
                    <h3>FIRST FLOOR</h3>
                    <button className="miniBtn" onClick={() => copyText(sections.first)}>Copy</button>
                  </div>
                  <pre>{sections.first}</pre>
                </div>

                <div className="block">
                  <div className="blockTop">
                    <h3>FEATURES</h3>
                    <button className="miniBtn" onClick={() => copyText(sections.features)}>Copy</button>
                  </div>
                  <pre>{sections.features}</pre>
                </div>

                <button className="btn btn--ghost" type="button" onClick={() => copyText(result)}>
                  Copy Full Output
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="hp__footer">
        <p>React + FastAPI + Gemini 2.5 Flash </p>
      </footer>
    </div>
  );
}
