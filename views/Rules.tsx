import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';

export const Rules: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-0 hover:bg-transparent text-white w-auto">
          <ArrowLeft size={24} />
        </Button>
        <h2 className="text-2xl font-bold">Spelregels</h2>
      </div>

      <div className="space-y-6">
        <section className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
          <h3 className="text-green-400 font-bold mb-2">Basisregels</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            <li>Elke ronde kiest 1 speler 5 nummers.</li>
            <li>Deze nummers hebben een <strong>geheim thema</strong>.</li>
            <li>Andere spelers raden titel, artiest en het thema.</li>
          </ul>
        </section>

        <section className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
          <h3 className="text-blue-400 font-bold mb-2">Puntentelling</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex justify-between"><span>Juiste Titel</span> <span className="font-bold">+1 pt</span></li>
            <li className="flex justify-between"><span>Juiste Artiest</span> <span className="font-bold">+1 pt</span></li>
            <li className="flex justify-between"><span>Juist Thema</span> <span className="font-bold">+3 pt</span></li>
          </ul>
        </section>

        <section className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl">
          <h3 className="text-purple-400 font-bold mb-2">Moeilijkheidsgraden</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div>
              <p className="font-bold text-white">Eenvoudig</p>
              <p className="italic text-xs text-gray-400">"Nummers met kleuren in de titel"</p>
            </div>
            <div>
              <p className="font-bold text-white">Moeilijk</p>
              <p className="italic text-xs text-gray-400">"Nummers uitgebracht in 1999"</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};