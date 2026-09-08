import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

import {
  X,
  MapPin,
  MapPinned,
  LocateFixed,
  CheckCircle2,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';


// ==================================================
// FIX LEAFLET DEFAULT MARKER ICON
// ==================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',

  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',

  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


// ==================================================
// MAP CLICK COMPONENT
// ==================================================

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });

  return null;
}


// ==================================================
// MAP CENTER COMPONENT
// ==================================================

function MapCenterUpdater({ position }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.setView(
        [
          position.latitude,
          position.longitude,
        ],
        map.getZoom(),
        {
          animate: true,
        }
      );
    }
  }, [position, map]);

  return null;
}


// ==================================================
// MAP PICKER MODAL
//
// This component is loaded lazily (via React.lazy in
// App.jsx) so the Leaflet map library — CSS, tiles, and
// JS — is only downloaded the first time a customer
// actually opens the map, instead of being part of the
// app's initial page load.
// ==================================================

export default function MapPickerModal({
  isMapOpen,
  setIsMapOpen,
  mapPosition,
  isLocating,
  onMapLocationSelect,
  onUseCurrentLocation,
  onConfirmMapLocation,
}) {

  return (

    <AnimatePresence>

      {isMapOpen && (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 z-[200] overflow-hidden bg-black/80 p-3 backdrop-blur-sm sm:p-6"
          style={{ WebkitBackdropFilter: 'blur(4px)' }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
            }}
            className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#101010] shadow-2xl"
          >

            {/* MAP HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-5">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <MapPinned
                    size={17}
                    className="shrink-0 text-amber-400"
                  />

                  <h3 className="truncate text-sm font-black sm:text-base">

                    Pick Exact Delivery Location

                  </h3>

                </div>

                <p className="mt-1 text-[9px] text-zinc-500 sm:text-[10px]">

                  Move the pin to your house or delivery
                  point for more accurate delivery.

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setIsMapOpen(false)
                }
                disabled={isLocating}
                className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >

                <X size={18} />

              </button>

            </div>


            {/* MAP */}

            <div className="relative min-h-0 flex-1">

              {mapPosition && (

                <MapContainer
                  center={[
                    mapPosition.latitude,
                    mapPosition.longitude,
                  ]}
                  zoom={18}
                  scrollWheelZoom={true}
                  className="h-full w-full"
                >

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  {/* IMPORTANT:
                      This keeps the existing Leaflet map
                      centered whenever mapPosition changes.
                  */}

                  <MapCenterUpdater
                    position={
                      mapPosition
                    }
                  />


                  <MapClickHandler
                    onLocationSelect={
                      onMapLocationSelect
                    }
                  />


                  <Marker
                    position={[
                      mapPosition.latitude,
                      mapPosition.longitude,
                    ]}
                    draggable={true}
                    eventHandlers={{
                      dragend:
                        (event) => {

                          const marker =
                            event.target;

                          const position =
                            marker.getLatLng();

                          onMapLocationSelect(
                            {
                              latitude:
                                position.lat,

                              longitude:
                                position.lng,
                            }
                          );
                        },
                    }}
                  />

                </MapContainer>

              )}


              {/* MAP INSTRUCTION */}

              <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2">

                <div className="rounded-full border border-white/10 bg-black/80 px-3 py-2 text-center text-[9px] font-bold text-white shadow-lg backdrop-blur-md">

                  📍 Drag the pin to your house

                </div>

              </div>


              {/* GPS BUTTON */}

              <button
                type="button"
                onClick={
                  onUseCurrentLocation
                }
                disabled={
                  isLocating
                }
                className={`absolute bottom-4 right-4 z-[500] flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[9px] font-bold shadow-xl backdrop-blur-md transition ${
                  isLocating
                    ? 'cursor-not-allowed border-zinc-700 bg-[#101010]/95 text-zinc-500'
                    : 'border-zinc-700 bg-[#101010]/95 text-white hover:border-amber-500 hover:text-amber-400'
                }`}
              >

                {isLocating ? (

                  <motion.span
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="flex"
                  >

                    <LocateFixed
                      size={13}
                    />

                  </motion.span>

                ) : (

                  <LocateFixed
                    size={13}
                  />

                )}

                {isLocating
                  ? 'Locating...'
                  : 'Use My Location'}

              </button>


              {/* GPS LOADING OVERLAY */}

              <AnimatePresence>

                {isLocating && (

                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/55 px-5 backdrop-blur-[3px]"
                    style={{ WebkitBackdropFilter: 'blur(3px)' }}
                  >

                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 15,
                        scale: 0.94,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                        scale: 0.96,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 22,
                        stiffness: 260,
                      }}
                      className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-amber-400/20 bg-[#101010]/95 p-6 text-center shadow-2xl shadow-black/60 backdrop-blur-xl"
                      style={{ WebkitBackdropFilter: 'blur(24px)' }}
                    >

                      <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-28 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[45px]" />


                      <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">

                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.35,
                              1,
                            ],
                            opacity: [
                              0.35,
                              0,
                              0.35,
                            ],
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                          className="absolute inset-0 rounded-full border border-amber-400/50"
                        />


                        <motion.div
                          animate={{
                            scale: [
                              1,
                              1.18,
                              1,
                            ],
                            opacity: [
                              0.5,
                              0.15,
                              0.5,
                            ],
                          }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="absolute inset-2 rounded-full border border-orange-400/30"
                        />


                        <motion.div
                          animate={{
                            y: [
                              0,
                              -5,
                              0,
                            ],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-black shadow-lg shadow-orange-500/30"
                        >

                          <LocateFixed
                            size={27}
                            strokeWidth={2.5}
                          />

                        </motion.div>

                      </div>


                      <h3 className="relative text-base font-black text-white sm:text-lg">

                        Finding Your Location

                      </h3>


                      <p className="relative mt-2 text-[10px] leading-5 text-zinc-400 sm:text-xs">

                        Please wait while we get your
                        current location.

                      </p>


                      <div className="relative mt-5 flex items-center justify-center gap-1.5">

                        {[0, 1, 2].map(
                          (dot) => (

                            <motion.span
                              key={
                                dot
                              }
                              animate={{
                                y: [
                                  0,
                                  -5,
                                  0,
                                ],
                                opacity: [
                                  0.35,
                                  1,
                                  0.35,
                                ],
                              }}
                              transition={{
                                duration: 0.9,
                                repeat: Infinity,
                                delay:
                                  dot *
                                  0.15,
                                ease: 'easeInOut',
                              }}
                              className="h-1.5 w-1.5 rounded-full bg-amber-400"
                            />

                          )
                        )}

                      </div>


                      <div className="relative mt-5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5">

                        <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-zinc-500">

                          <MapPin
                            size={11}
                            className="text-amber-400"
                          />

                          Keep location services enabled

                        </div>

                      </div>

                    </motion.div>

                  </motion.div>

                )}

              </AnimatePresence>

            </div>


            {/* MAP FOOTER */}

            <div className="shrink-0 border-t border-zinc-800 bg-[#0c0c0c] p-3 sm:p-4">

              {mapPosition && (

                <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3">

                  <div className="flex items-center gap-2 text-[10px] font-bold text-green-400">

                    <LocateFixed
                      size={13}
                    />

                    Selected location

                  </div>


                  <div className="mt-1 text-[9px] text-zinc-500">

                    {mapPosition.latitude.toFixed(
                      7
                    )}

                    {', '}

                    {mapPosition.longitude.toFixed(
                      7
                    )}

                  </div>

                </div>

              )}


              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setIsMapOpen(
                      false
                    )
                  }
                  disabled={isLocating}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >

                  Cancel

                </button>


                <button
                  type="button"
                  onClick={
                    onConfirmMapLocation
                  }
                  disabled={
                    isLocating
                  }
                  className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-orange-500 px-2 py-2.5 text-[9px] font-black leading-tight text-black sm:gap-2 sm:py-3 sm:text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <CheckCircle2
                    size={23}
                  />

                  Confirm Exact Location

                </button>

              </div>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  );
}