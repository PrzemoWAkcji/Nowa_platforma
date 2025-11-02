"use client";

import { CompetitionLogo, Heat } from "@/types";
import Image from "next/image";
import React from "react";

// Używamy globalnego typu HeatLane z @/types

interface Lane {
  number: number;
  athlete?: {
    id: string;
    registrationId: string;
    firstName: string;
    lastName: string;
    club?: string;
    bibNumber?: string;
    seedTime?: string;
  };
}

interface Event {
  id: string;
  name: string;
  category: string;
  gender: string;
  type: string;
}

interface Competition {
  id: string;
  name: string;
  startDate: string;
  location: string;
  logos?: CompetitionLogo[];
}

interface RosterStyleProtocolProps {
  event: Event;
  competition: Competition;
  heats: Heat[];
  isFieldEvent: boolean;
  numberOfTrials?: 3 | 4 | 6;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const RosterStyleProtocol: React.FC<RosterStyleProtocolProps> = ({
  event,
  competition,
  heats,
  isFieldEvent,
  numberOfTrials = 3,
}) => (
  <div className="print:text-xs">
    {heats.map((heat, heatIndex) => (
      <div
        key={heat.id}
        className={`min-h-screen print:min-h-0 print:h-auto ${heatIndex > 0 ? "page-break-before print:break-before-page" : ""}`}
      >
        {/* Nagłówek w stylu Roster Athletics */}
        <div className="mb-4 print:mb-2">
          {/* Niebieski pasek z nazwą konkurencji */}
          <div className="bg-blue-400 text-white p-2 print:p-1 mb-1">
            <h1 className="text-base print:text-sm font-bold">
              {event.name} {event.category} (
              {isFieldEvent ? "FINAŁ" : `SERIA ${heat.heatNumber}`})
            </h1>
          </div>
          <div className="bg-blue-300 text-white p-1 print:p-0.5">
            <h2 className="text-sm print:text-xs font-semibold">
              Protokół sędziowski - KONKURENCJE TECHNICZNE
            </h2>
          </div>

          {/* Informacje o zawodach po prawej stronie */}
          <div className="flex justify-between items-start mt-2 print:mt-1">
            <div className="flex-1"></div>
            <div className="text-center">
              <h3 className="text-base print:text-sm font-bold">
                {competition.name}
              </h3>
              <p className="text-xs print:text-xs">
                {competition.location}, {formatDate(competition.startDate)}
              </p>

              {/* Logo zawodów */}
              {competition.logos &&
              competition.logos.filter((logo) => logo.isVisible !== false)
                .length > 0 ? (
                <div className="flex justify-center items-center space-x-2 mt-1 h-12 print:h-8">
                  {competition.logos
                    .filter((logo) => logo.isVisible !== false)
                    .slice(0, 5)
                    .map((logo) => (
                      <Image
                        key={logo.id}
                        src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}${logo.url}`}
                        alt={logo.originalName}
                        width={40}
                        height={40}
                        className="max-h-10 max-w-16 print:max-h-6 print:max-w-12 object-contain"
                      />
                    ))}
                </div>
              ) : (
                <div className="w-12 h-12 print:w-8 print:h-8 border-2 border-dashed border-gray-300 mx-auto mt-1 flex items-center justify-center">
                  <span className="text-xs print:text-xs text-gray-400">
                    LOGO
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sekcja sędziów - kompaktowa */}
          <div className="mt-2 print:mt-1 text-xs print:text-xs">
            <div className="flex justify-between">
              <div>
                <strong>Sędzia główny:</strong>
                <br />
                <strong>Notujący:</strong>
              </div>
              <div className="text-right">
                <div className="flex gap-4 print:gap-2">
                  <span>godz. rozpoczęcia: _____</span>
                  <span>godz. zakończenia: _____</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela w stylu Roster Athletics */}
        <table className="w-full border-collapse border border-gray-400 text-xs print:text-xs">
          <thead>
            <tr>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-6 print:w-6">
                Lp
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-10 print:w-8">
                Nr
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 text-left">
                Imię i Nazwisko
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-16 print:w-12">
                Data ur.
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100">
                Klub/Kraj
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-12 print:w-10">
                Rek.
              </th>

              {/* Kolumny prób */}
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                I
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                II
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                III
              </th>

              {/* Sekcja "po 3 próbach" */}
              <th
                className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-200 text-center"
                colSpan={2}
              >
                po 3 próbach
                <br />
                <div className="flex text-xs print:text-xs">
                  <span className="flex-1 border-r border-gray-400">
                    kolej.
                  </span>
                  <span className="flex-1">Wynik</span>
                </div>
              </th>

              {/* Dodatkowe próby jeśli więcej niż 3 */}
              {numberOfTrials > 3 && (
                <>
                  <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                    IV
                  </th>
                  {numberOfTrials > 4 && (
                    <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                      V
                    </th>
                  )}
                  {numberOfTrials > 5 && (
                    <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-8 print:w-6">
                      VI
                    </th>
                  )}
                </>
              )}

              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-12 print:w-10">
                Wynik
              </th>
              <th className="border border-gray-400 p-0.5 print:p-0.5 bg-gray-100 w-6 print:w-6">
                lok.
              </th>
            </tr>
          </thead>
          <tbody>
            {heat.lanes
              .filter((lane) => lane.athlete)
              .map((lane, index) => (
                <tr key={lane.laneNumber} className="h-6 print:h-5">
                  <td className="border border-gray-400 p-0.5 print:p-0.5 text-center font-bold">
                    {index + 1}
                  </td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 text-center font-bold">
                    {lane.registration?.bibNumber || ""}
                  </td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 font-medium">
                    {lane.athlete
                      ? `${lane.athlete.firstName} ${lane.athlete.lastName}`
                      : ""}
                  </td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 text-center text-xs">
                    {/* Data urodzenia - placeholder */}
                  </td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 text-xs">
                    {lane.athlete?.club || ""}
                  </td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 text-xs">
                    {/* Rekordy - placeholder */}
                    {lane.registration?.seedTime || lane.seedTime || ""}
                  </td>

                  {/* Próby I, II, III */}
                  <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5"></td>

                  {/* Po 3 próbach - kolejność i wynik */}
                  <td className="border border-gray-400 p-0.5 print:p-0.5 w-6"></td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5 w-10"></td>

                  {/* Dodatkowe próby */}
                  {numberOfTrials > 3 && (
                    <>
                      <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                      {numberOfTrials > 4 && (
                        <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                      )}
                      {numberOfTrials > 5 && (
                        <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                      )}
                    </>
                  )}

                  <td className="border border-gray-400 p-0.5 print:p-0.5 bg-yellow-50"></td>
                  <td className="border border-gray-400 p-0.5 print:p-0.5"></td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Stopka - kompaktowa */}
        <div className="mt-4 print:mt-2 text-xs print:text-xs">
          <div className="flex justify-between items-end">
            <div>
              <p>
                {competition.location} {new Date().getFullYear()}
              </p>
            </div>
            <div className="text-center">
              <p>Athletics Platform - athletics-platform.pl</p>
            </div>
            <div className="text-right">
              <p>Strona 1 z 1</p>
              <p>
                {new Date().toLocaleDateString("pl-PL")}{" "}
                {new Date().toLocaleTimeString("pl-PL")}
              </p>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
