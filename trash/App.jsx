import { useState } from "react";

function App() {
  const [width, setWidth] = useState(0);
  const [height, setHight] = useState(0);
  const [count, setCount] = useState(0);

  return (
    <div className="react-app-main">
      <div className="flex flex-col items-center justify-center w-full p-4 bg-cyan-800">
        <div className="text-white text-3xl mb-4">
          <h1 className="text-2xl text-center">
            Hier könnte ihre Werbung stehen
          </h1>
        </div>

        <form className="w-[100%] flex flex-col items-center justify-center">
          <div className="flex flex-wrap gap-4 items-center justify-center md:justify-between w-[100%] md:w-[50%] ">
            <label className="text-white mb-2 w-[90%] md:w-[47%] ">
              <div className="relative inline-block w-full">
                <input
                  type="text"
                  className="border rounded p-2 pr-8 w-full"
                  placeholder="Geben Sie hier Ihre Länge in Meter ein"
                  onChange={(e) =>
                    setWidth(Number(e.target.value.split(",").join(".")))
                  }
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-200 text-sm">
                  m
                </span>
              </div>

              {/* <input
                type="number"
                placeholder="Geben Sie hier Ihre Breite in Meter ein"
                className="p-2 border border-gray-300 rounded mb-4 w-64"
                onChange={(e) => setWidth(e.target.value)}
              /> */}
            </label>
            <label className="text-white mb-2 w-[90%] md:w-[47%] ">
              <div className="relative inline-block w-full">
                <input
                  type="text"
                  className="border rounded p-2 pr-8 w-full"
                  placeholder="Geben Sie hier Ihre Breite in Meter ein"
                  onChange={(e) =>
                    setHight(Number(e.target.value.split(",").join(".")))
                  }
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-200 text-sm">
                  m
                </span>
              </div>
            </label>

            <button
              type="button"
              className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-500 w-[90%] md:w-[100%]"
              onClick={() => setCount(Math.ceil(width * height * 100) / 100)}
            >
              Berechnen
            </button>
          </div>
        </form>

        <div className="text-white mt-4 border-t pt-4 w-[100%] text-center">
          <p className="text-xl">Sie benötigen {count} qm Teppich</p>
        </div>
      </div>
    </div>
  );
}

export default App;
