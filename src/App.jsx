import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import {
  ShoppingCart,
  MapPin,
  X,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Pizza,
  Sandwich,
  Gift,
  UtensilsCrossed,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  Home,
  Navigation,
  LocateFixed,
  MapPinned,
  MessageCircle,
  Mail,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';

import FoodCard from './components/FoodCard';
import { MENU_ITEMS } from './data/menu';


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
// MAIN APP
// ==================================================

export default function App() {

  // ==================================================
  // STATES
  // ==================================================

  const [activeCategory, setActiveCategory] =
    useState('all');

  const [cart, setCart] =
    useState([]);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  // BRAND / CONTACT POPUP
  const [isInfoOpen, setIsInfoOpen] =
    useState(false);

  const [userName, setUserName] =
    useState('');

  const [phoneNumber, setPhoneNumber] =
    useState('');

  const [address, setAddress] =
    useState('');

  // REQUIRED LANDMARK
  const [landmark, setLandmark] =
    useState('');

  const [locationStatus, setLocationStatus] =
    useState('');

  const [deliveryCoordinates, setDeliveryCoordinates] =
    useState(null);

  const [mapPosition, setMapPosition] =
    useState(null);

  const [isMapOpen, setIsMapOpen] =
    useState(false);

  const [savedAddresses, setSavedAddresses] =
    useState([]);

  const [selectedAddress, setSelectedAddress] =
    useState('');

  const [addressMode, setAddressMode] =
    useState('new');

  // GPS LOADING STATE
  const [isLocating, setIsLocating] =
    useState(false);

  // Tracks whether the customer has already interacted with
  // address/GPS/map selection. This prevents the name field
  // from resetting a location chosen before the name.
  const hasActiveLocationSelection = useRef(false);


  // ==================================================
  // DEFAULT MAP POSITION
  // ==================================================

  const DEFAULT_LOCATION = {
    latitude: 17.6818168,
    longitude: 83.2618589,
  };


  // ==================================================
  // PREVENT BACKGROUND PAGE SCROLL
  // ==================================================

  useEffect(() => {

    const overlayOpen =
      isInfoOpen ||
      isCartOpen ||
      isMapOpen;

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    if (overlayOpen) {

      document.body.style.overflow =
        'hidden';

      document.documentElement.style.overflow =
        'hidden';

    } else {

      document.body.style.overflow =
        '';

      document.documentElement.style.overflow =
        '';
    }

    return () => {

      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;
    };

  }, [
    isInfoOpen,
    isCartOpen,
    isMapOpen,
  ]);


  // ==================================================
  // LOAD CUSTOMER ADDRESSES
  // ==================================================

  useEffect(() => {

    if (!userName.trim()) {

      setSavedAddresses([]);

      // IMPORTANT:
      // Do not clear address/location fields here.
      // This effect runs whenever the name changes, so clearing
      // them would destroy a GPS/exact-map selection made before
      // the customer entered their name.
      return;
    }

    try {

      const storedAddresses =
        JSON.parse(
          localStorage.getItem(
            'foodOrbitAddresses'
          ) || '{}'
        );

      const customerKey =
        userName
          .trim()
          .toLowerCase();

      const customerAddresses =
        storedAddresses[customerKey] || [];

      setSavedAddresses(
        customerAddresses
      );

      // If the customer already entered an address, selected GPS,
      // or picked an exact map location before entering their name,
      // preserve that work. Only refresh the saved-address list.
      if (hasActiveLocationSelection.current) {
        return;
      }

      if (customerAddresses.length > 0) {

        setAddressMode('old');

        const firstAddress =
          customerAddresses[0];

        // NEW FORMAT
        if (
          typeof firstAddress === 'object' &&
          firstAddress !== null
        ) {

          setSelectedAddress(
            firstAddress.address || ''
          );

          setAddress(
            firstAddress.address || ''
          );

          setLandmark(
            firstAddress.landmark || ''
          );

          if (
            typeof firstAddress.latitude === 'number' &&
            typeof firstAddress.longitude === 'number'
          ) {

            const coordinates = {
              latitude:
                firstAddress.latitude,

              longitude:
                firstAddress.longitude,
            };

            setDeliveryCoordinates(
              coordinates
            );

            setMapPosition(
              coordinates
            );

          } else {

            setDeliveryCoordinates(null);
            setMapPosition(null);
          }

        } else {

          // OLD FORMAT
          setSelectedAddress(
            firstAddress
          );

          setAddress(
            firstAddress
          );

          setLandmark('');

          setDeliveryCoordinates(null);
          setMapPosition(null);
        }

      } else {

        setAddressMode('new');
        setSelectedAddress('');
        setAddress('');
        setLandmark('');
        setDeliveryCoordinates(null);
        setMapPosition(null);
      }

    } catch (error) {

      console.error(
        'Unable to load saved addresses:',
        error
      );

      setSavedAddresses([]);
      setAddressMode('new');
      setSelectedAddress('');
      setAddress('');
      setLandmark('');
      setDeliveryCoordinates(null);
      setMapPosition(null);
    }

  }, [userName]);


  // ==================================================
  // CART
  // ==================================================

  const addToCart = (item) => {

    setCart((prev) => {

      const existingItem =
        prev.find(
          (cartItem) =>
            cartItem.id === item.id
        );

      if (existingItem) {

        return prev.map(
          (cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  qty:
                    cartItem.qty + 1,
                }
              : cartItem
        );
      }

      return [
        ...prev,
        {
          ...item,
          qty: 1,
        },
      ];
    });
  };


  const removeFromCart = (id) => {

    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };


  const updateQuantity = (
    id,
    delta
  ) => {

    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty:
                  item.qty + delta,
              }
            : item
        )
        .filter(
          (item) =>
            item.qty > 0
        )
    );
  };


  const getItemQuantity = (id) => {

    const item =
      cart.find(
        (cartItem) =>
          cartItem.id === id
      );

    return item
      ? item.qty
      : 0;
  };


  // ==================================================
  // TOTALS
  // ==================================================

  const totalAmount =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.qty,
      0
    );

  const totalCount =
    cart.reduce(
      (sum, item) =>
        sum + item.qty,
      0
    );


  // ==================================================
  // CATEGORY FILTER
  // ==================================================

  const filteredItems =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter(
          (item) =>
            item.category ===
            activeCategory
        );


  const categories = [
    {
      id: 'all',
      name: 'All',
      icon: Sparkles,
    },

    {
      id: 'pizza',
      name: 'Pizza',
      icon: Pizza,
    },

    {
      id: 'burger',
      name: 'Burger',
      icon: UtensilsCrossed,
    },

    {
      id: 'sandwich',
      name: 'Sandwich',
      icon: Sandwich,
    },

    {
      id: 'combo',
      name: 'Combos',
      icon: Gift,
    },
  ];


  // ==================================================
  // FIND COORDINATES FROM MANUAL ADDRESS
  //
  // NOTE:
  //
  // `options.bias` biases the Nominatim search toward
  // the Visakhapatnam area (where this business
  // delivers) using a viewbox, WITHOUT strictly
  // excluding results outside it. This fixes the
  // "wrong / inaccurate pin" issue that happened when
  // a common street/area name matched a place
  // elsewhere in India.
  // ==================================================

  const geocodeAddress = async (
    addressText,
    options = {}
  ) => {

    if (!addressText.trim()) {
      return null;
    }

    try {

      // Rough bounding box around Visakhapatnam:
      // left,top,right,bottom (lon,lat,lon,lat)
      const viewboxParam =
        options.bias
          ? '&viewbox=83.10,17.85,83.50,17.55&bounded=0'
          : '';

      const response =
        await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&addressdetails=1&countrycodes=in${viewboxParam}&q=${encodeURIComponent(
            addressText.trim()
          )}`,
          {
            headers: {
              Accept:
                'application/json',
            },
          }
        );

      if (!response.ok) {
        return null;
      }

      const results =
        await response.json();

      if (
        !results ||
        results.length === 0
      ) {
        return null;
      }

      const latitude =
        Number(results[0].lat);

      const longitude =
        Number(results[0].lon);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return null;
      }

      return {
        latitude,
        longitude,
      };

    } catch (error) {

      console.error(
        'Unable to find address location:',
        error
      );

      return null;
    }
  };


  // ==================================================
  // USE MY LOCATION
  // ==================================================

  const handleUseMyLocation = () => {

    hasActiveLocationSelection.current = true;

    if (isLocating) {
      return;
    }

    if (!navigator.geolocation) {

      setLocationStatus(
        'GPS is not supported by your browser.'
      );

      alert(
        'GPS is not supported by your browser.\n\n' +
        'Please enter your delivery address manually.'
      );

      return;
    }

    setIsLocating(true);

    setLocationStatus(
      'Finding your current location...'
    );

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const coordinates = {
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        };

        setDeliveryCoordinates(
          coordinates
        );

        setMapPosition(
          coordinates
        );

        setLocationStatus(
          'Your current device location has been selected.'
        );

        setIsLocating(false);

        alert(
          '📍 Location selected successfully!\n\n' +
          'Please enter your nearby landmark.\n\n' +
          'Examples:\n' +
          'Near Hanuman Temple\n' +
          'Beside ABC School\n' +
          'Opposite XYZ Shop'
        );
      },

      (error) => {

        console.error(
          'GPS error:',
          error
        );

        setIsLocating(false);

        if (error.code === 1) {

          setLocationStatus(
            'Location permission was denied. Please allow location access in your browser.'
          );

          alert(
            'Location permission was denied.\n\n' +
            'Please allow location access or enter your delivery address manually.'
          );

        } else if (error.code === 2) {

          setLocationStatus(
            'Your device location could not be determined.'
          );

          alert(
            'Unable to determine your location.\n\n' +
            'Please enter your delivery address manually.'
          );

        } else if (error.code === 3) {

          setLocationStatus(
            'Location request timed out. Please try again.'
          );

          alert(
            'Location request timed out.\n\n' +
            'Please try again or enter your delivery address manually.'
          );

        } else {

          setLocationStatus(
            'Unable to get your device location.'
          );

          alert(
            'Unable to get your location.\n\n' +
            'Please enter your delivery address manually.'
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };


  // ==================================================
  // OPEN EXACT LOCATION MAP
  // ==================================================

  const handleOpenMap = async () => {

    /*
     * IMPORTANT:
     *
     * If the user has typed an address, ALWAYS use
     * that current address first.
     *
     * This prevents old GPS coordinates or old saved
     * coordinates from taking priority.
     */

    if (address.trim()) {

      setIsMapOpen(true);

      setIsLocating(true);

      setLocationStatus(
        'Finding your typed address on the map...'
      );

      /*
       * SEARCH STRATEGY (most accurate first):
       *
       * 1. Address + city context ("Visakhapatnam,
       *    Andhra Pradesh"), biased toward Vizag.
       *    This is what makes plain house/area
       *    addresses resolve accurately instead of
       *    matching a same-named street elsewhere
       *    in India.
       *
       * 2. Plain address, biased toward Vizag.
       *
       * 3. Address + landmark, biased toward Vizag.
       *    Landmark text (e.g. "Near Hanuman Temple")
       *    is tried LAST because combining it with the
       *    address up front was what caused inaccurate
       *    pins previously — landmark names are common
       *    and can match a different place entirely.
       *
       * 4. Address alone, unbiased, as a final
       *    fallback for addresses outside Vizag.
       */

      const hasCityContext =
        /visakhapatnam|vizag/i.test(
          address.trim()
        );

      const cityContext =
        hasCityContext
          ? ''
          : ', Visakhapatnam, Andhra Pradesh';

      let coordinates =
        await geocodeAddress(
          `${address.trim()}${cityContext}`,
          { bias: true }
        );

      if (!coordinates) {

        coordinates =
          await geocodeAddress(
            address.trim(),
            { bias: true }
          );
      }

      if (
        !coordinates &&
        landmark.trim()
      ) {

        coordinates =
          await geocodeAddress(
            `${address.trim()}, ${landmark.trim()}${cityContext}`,
            { bias: true }
          );
      }

      if (!coordinates) {

        coordinates =
          await geocodeAddress(
            address.trim()
          );
      }

      setIsLocating(false);

      /*
       * ADDRESS FOUND
       */

      if (coordinates) {

        setDeliveryCoordinates(
          coordinates
        );

        setMapPosition(
          coordinates
        );

        setLocationStatus(
          'Address found. Please verify the pin is on your exact location — drag it to adjust if needed.'
        );

        return;
      }

      /*
       * ADDRESS NOT FOUND
       *
       * Do NOT use old coordinates here.
       */

      setDeliveryCoordinates(null);

      setMapPosition(
        DEFAULT_LOCATION
      );

      setLocationStatus(
        '⚠️ Address could not be found automatically. Please move the pin to your exact location.'
      );

      return;
    }


    // ==================================================
    // NO MANUAL ADDRESS
    // ==================================================

    if (deliveryCoordinates) {

      setIsMapOpen(true);

      setMapPosition(
        deliveryCoordinates
      );

      setLocationStatus(
        'Move the pin if you want to change the exact location.'
      );

      return;
    }


    // ==================================================
    // NO ADDRESS + NO COORDINATES
    // USE GPS
    // ==================================================

    if (navigator.geolocation) {

      setIsMapOpen(true);

      setIsLocating(true);

      setLocationStatus(
        'Finding your current location...'
      );

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const coordinates = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          setDeliveryCoordinates(
            coordinates
          );

          setMapPosition(
            coordinates
          );

          const accuracy =
            position.coords.accuracy;

          /*
           * IMPORTANT:
           *
           * getCurrentPosition can "succeed" while still
           * being wildly inaccurate — especially on
           * desktops/laptops with no GPS chip, where the
           * browser falls back to WiFi/IP-based positioning
           * that can be off by kilometers. A poor accuracy
           * value (large radius, in meters) is the signal
           * that this happened, so warn instead of silently
           * dropping a misleading pin.
           */

          if (
            typeof accuracy === 'number' &&
            accuracy > 300
          ) {

            setLocationStatus(
              `⚠️ GPS location found, but accuracy is low (±${Math.round(accuracy)}m). Please drag the pin to your exact spot.`
            );

            alert(
              '⚠️ Your device location was found, but it may ' +
              `be inaccurate (±${Math.round(accuracy)} meters).\n\n` +
              'This is common on laptops/desktops without GPS.\n\n' +
              'Please drag the pin to your exact delivery ' +
              'location, or close this and type your address ' +
              'instead.'
            );

          } else {

            setLocationStatus(
              'GPS location found. Move the pin to your exact delivery location.'
            );
          }

          setIsLocating(false);
        },

        (error) => {

          console.error(
            'GPS error:',
            error
          );

          setIsLocating(false);

          setMapPosition(
            DEFAULT_LOCATION
          );

          setLocationStatus(
            'Could not get GPS. Move the pin manually to your delivery location.'
          );

          alert(
            '⚠️ We could not get your device location.\n\n' +
            'Showing a placeholder location — please drag ' +
            'the pin on the map to your exact delivery spot, ' +
            'or close this and type your address instead.'
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      return;
    }


    // ==================================================
    // FINAL FALLBACK
    // ==================================================

    setIsMapOpen(true);

    setMapPosition(
      DEFAULT_LOCATION
    );

    setLocationStatus(
      'GPS is unavailable. Please move the pin manually.'
    );
  };


  // ==================================================
  // USE CURRENT LOCATION INSIDE MAP
  // ==================================================

  const handleUseCurrentLocation =
    () => {

      hasActiveLocationSelection.current = true;

      if (isLocating) {
        return;
      }

      if (!navigator.geolocation) {

        setLocationStatus(
          'GPS is not supported by your browser.'
        );

        alert(
          'GPS is not supported by your browser.'
        );

        return;
      }

      setIsLocating(true);

      setLocationStatus(
        'Getting your current location...'
      );

      navigator.geolocation.getCurrentPosition(

        (position) => {

          const coordinates = {
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,
          };

          setDeliveryCoordinates(
            coordinates
          );

          setMapPosition(
            coordinates
          );

          setLocationStatus(
            'Current location found. Move the pin if necessary.'
          );

          setIsLocating(false);

          alert(
            '📍 Current location pinned!\n\n' +
            'Please make sure you have entered a nearby landmark before placing the order.'
          );
        },

        (error) => {

          console.error(
            'GPS error:',
            error
          );

          setIsLocating(false);

          setLocationStatus(
            'Unable to get GPS. Please move the pin manually.'
          );

          alert(
            'Unable to get your current location.\n\n' +
            'Please move the pin manually on the map.'
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    };


  // ==================================================
  // MAP LOCATION SELECTED
  // ==================================================

  const handleMapLocationSelect =
    (coordinates) => {

      hasActiveLocationSelection.current = true;

      setMapPosition(
        coordinates
      );

      setLocationStatus(
        'Pin moved. Make sure it is at the correct delivery location.'
      );
    };


  // ==================================================
  // CONFIRM MAP LOCATION
  // ==================================================

  const handleConfirmMapLocation =
    () => {

      if (!mapPosition) {

        alert(
          'Please select a location on the map.'
        );

        return;
      }

      hasActiveLocationSelection.current = true;

      setDeliveryCoordinates(
        mapPosition
      );

      setLocationStatus(
        'Exact delivery location confirmed!'
      );

      setIsMapOpen(false);
    };


  // ==================================================
  // MANUAL ADDRESS CHANGE
  // ==================================================

  const handleManualAddressChange =
    (value) => {

      hasActiveLocationSelection.current = true;

      setAddress(value);

      setSelectedAddress('');

      setAddressMode('new');

      /*
       * IMPORTANT:
       *
       * Clear old coordinates whenever the address
       * changes.
       *
       * Otherwise an old GPS/map location could be
       * accidentally submitted for the new address.
       */

      setDeliveryCoordinates(null);

      setMapPosition(null);

      if (value.trim()) {

        setLocationStatus(
          'Address updated. Pick exact location to place the pin near your address.'
        );

      } else {

        setLocationStatus('');
      }
    };


  // ==================================================
  // MANUAL LANDMARK CHANGE
  // ==================================================

  const handleManualLandmarkChange =
    (value) => {

      hasActiveLocationSelection.current = true;

      setLandmark(value);

      /*
       * If a manual address exists, changing the landmark
       * invalidates the previous geocoded pin because the
       * landmark is part of the address search.
       *
       * If there is NO manual address, the customer may be
       * using GPS / exact map location. In that case, changing
       * the landmark must NOT erase the selected coordinates.
       */

      if (address.trim()) {
        setDeliveryCoordinates(null);
        setMapPosition(null);
      }

      if (value.trim()) {

        setLocationStatus(
          'Landmark updated. Pick the exact location again if needed.'
        );

      } else {

        setLocationStatus('');
      }
    };


  // ==================================================
  // SELECT OLD ADDRESS
  // ==================================================

  const handleSelectOldAddress =
    (oldAddress) => {

      hasActiveLocationSelection.current = true;

      setAddressMode('old');

      if (
        typeof oldAddress === 'object' &&
        oldAddress !== null
      ) {

        const oldAddressText =
          oldAddress.address || '';

        setSelectedAddress(
          oldAddressText
        );

        setAddress(
          oldAddressText
        );

        setLandmark(
          oldAddress.landmark || ''
        );

        if (
          typeof oldAddress.latitude === 'number' &&
          typeof oldAddress.longitude === 'number'
        ) {

          const coordinates = {
            latitude:
              oldAddress.latitude,

            longitude:
              oldAddress.longitude,
          };

          setDeliveryCoordinates(
            coordinates
          );

          setMapPosition(
            coordinates
          );

          setLocationStatus(
            'Saved exact location selected.'
          );

        } else {

          setDeliveryCoordinates(null);

          setMapPosition(null);

          setLocationStatus(
            'Saved address selected. Pick the exact location if needed.'
          );
        }

        return;
      }


      // LEGACY STRING ADDRESS

      setSelectedAddress(
        oldAddress
      );

      setAddress(
        oldAddress
      );

      setLandmark('');

      setDeliveryCoordinates(null);

      setMapPosition(null);

      setLocationStatus(
        'Saved address selected. Please enter a nearby landmark before ordering.'
      );
    };


  // ==================================================
  // REMOVE OLD ADDRESS
  // ==================================================

  const handleRemoveOldAddress =
    (addressToRemove) => {

      if (!userName.trim()) {
        return;
      }

      try {

        const storedAddresses =
          JSON.parse(
            localStorage.getItem(
              'foodOrbitAddresses'
            ) || '{}'
          );

        const customerKey =
          userName
            .trim()
            .toLowerCase();

        const addressToRemoveText =
          typeof addressToRemove === 'string'
            ? addressToRemove
            : addressToRemove?.address;

        const updatedAddresses =
          savedAddresses.filter(
            (savedAddress) => {

              const savedText =
                typeof savedAddress === 'string'
                  ? savedAddress
                  : savedAddress?.address;

              return (
                savedText !==
                addressToRemoveText
              );
            }
          );

        storedAddresses[
          customerKey
        ] = updatedAddresses;

        localStorage.setItem(
          'foodOrbitAddresses',
          JSON.stringify(
            storedAddresses
          )
        );

        setSavedAddresses(
          updatedAddresses
        );

        if (
          selectedAddress ===
          addressToRemoveText
        ) {

          setSelectedAddress('');
          setAddress('');
          setLandmark('');
          setDeliveryCoordinates(null);
          setMapPosition(null);
          setLocationStatus('');
        }

        if (
          updatedAddresses.length === 0
        ) {

          setAddressMode('new');
        }

      } catch (error) {

        console.error(
          'Unable to remove saved address:',
          error
        );
      }
    };


  // ==================================================
  // USE NEW ADDRESS
  // ==================================================

  const handleUseNewAddress =
    () => {

      hasActiveLocationSelection.current = false;

      setAddressMode('new');

      setSelectedAddress('');

      setAddress('');

      setLandmark('');

      setDeliveryCoordinates(null);

      setMapPosition(null);

      setLocationStatus('');
    };


  // ==================================================
  // SAVE CUSTOMER ADDRESS
  // ==================================================

  const saveCustomerAddress =
    () => {

      if (
        !userName.trim() ||
        !address.trim() ||
        !landmark.trim()
      ) {
        return;
      }

      try {

        const storedAddresses =
          JSON.parse(
            localStorage.getItem(
              'foodOrbitAddresses'
            ) || '{}'
          );

        const customerKey =
          userName
            .trim()
            .toLowerCase();

        const existingAddresses =
          storedAddresses[
            customerKey
          ] || [];

        const cleanAddress =
          address.trim();

        const cleanLandmark =
          landmark.trim();

        const alreadyExists =
          existingAddresses.some(
            (savedAddress) => {

              const savedText =
                typeof savedAddress ===
                  'string'
                  ? savedAddress
                  : savedAddress.address;

              return (
                savedText
                  ?.trim()
                  .toLowerCase() ===
                cleanAddress
                  .toLowerCase()
              );
            }
          );

        if (!alreadyExists) {

          const newAddress = {

            address:
              cleanAddress,

            landmark:
              cleanLandmark,

            latitude:
              deliveryCoordinates
                ?.latitude ??
              null,

            longitude:
              deliveryCoordinates
                ?.longitude ??
              null,
          };

          const updatedAddresses =
            [
              ...existingAddresses,
              newAddress,
            ];

          const limitedAddresses =
            updatedAddresses.slice(-5);

          storedAddresses[
            customerKey
          ] =
            limitedAddresses;

          localStorage.setItem(
            'foodOrbitAddresses',
            JSON.stringify(
              storedAddresses
            )
          );

          /*
           * IMPORTANT:
           *
           * Intentionally NOT calling setSavedAddresses()
           * here. The address is persisted to localStorage
           * for next time, but we don't want the "Old
           * Address / New Address" picker to suddenly
           * appear in THIS session right after sending an
           * order — that should only show up on the next
           * fresh page load / refresh.
           */
        }

      } catch (error) {

        console.error(
          'Unable to save address:',
          error
        );
      }
    };


  // ==================================================
  // GOOGLE MAPS URL
  // ==================================================

  const createGoogleMapsUrl =
    () => {

      if (
        deliveryCoordinates
      ) {

        const {
          latitude,
          longitude,
        } =
          deliveryCoordinates;

        return (
          `https://www.google.com/maps/search/?api=1&query=` +
          `${latitude},${longitude}`
        );
      }

      return (
        `https://www.google.com/maps/search/?api=1&query=` +
        `${encodeURIComponent(
          address.trim()
        )}`
      );
    };


  // ==================================================
  // SEND ORDER ON WHATSAPP
  // ==================================================

  const handleSendOrder =
    () => {

      // CART VALIDATION

      if (!cart.length) {

        alert(
          '⚠️ Your cart is empty!'
        );

        return;
      }


      // NAME VALIDATION

      if (!userName.trim()) {

        alert(
          '⚠️ Please enter your name.'
        );

        return;
      }


      // PHONE NUMBER VALIDATION

      if (phoneNumber.trim().length !== 10) {

        alert(
          '⚠️ Please enter a valid 10-digit phone number.'
        );

        return;
      }


      // LOCATION VALIDATION
      // A typed address OR a confirmed GPS/map coordinate is enough.
      // Address is not required when exact location has been selected.

      if (!address.trim() && !deliveryCoordinates) {

        alert(
          '⚠️ Please enter your complete delivery address\n' +
          'or select your exact location using GPS/map.'
        );

        return;
      }


      // LANDMARK VALIDATION

      if (!landmark.trim()) {

        alert(
          '⚠️ Nearby landmark is required.\n\n' +
          'Please enter a nearby landmark such as:\n' +
          'Near Hanuman Temple\n' +
          'Beside ABC School\n' +
          'Opposite XYZ Shop'
        );

        return;
      }


      // GOOGLE MAPS URL

      const googleMapsUrl =
        createGoogleMapsUrl();

      const deliveryAddressText = address.trim()
        ? address.trim()
        : 'Address not manually entered — exact GPS/map location provided';


      // ORDER ITEMS

      const orderLines =
        cart
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} x${item.qty} - ₹${item.price * item.qty}`
          )
          .join('\n');


      // LOCATION MESSAGE

      let locationMessage = '';

      if (deliveryCoordinates) {

        locationMessage =
          `*EXACT DELIVERY LOCATION*\n` +
          `Exact location selected\n` +
          `Latitude: ${deliveryCoordinates.latitude}\n` +
          `Longitude: ${deliveryCoordinates.longitude}\n\n`;

      } else {

        locationMessage =
          `*DELIVERY LOCATION*\n` +
          `Exact map location was not selected.\n` +
          `Please use the delivery address below.\n\n`;
      }


      // FINAL WHATSAPP MESSAGE

      const message =
        `*NEW ORDER - THE SILENT FOOD CRITIC*\n\n` +

        `*ORDER ITEMS*\n` +
        `${orderLines}\n\n` +

        `*TOTAL AMOUNT*\n` +
        `₹${totalAmount}\n\n` +

        `*CUSTOMER DETAILS*\n` +
        `Name: ${userName.trim()}\n` +
        `Phone: ${phoneNumber.trim()}\n\n` +

        `*DELIVERY ADDRESS*\n` +
        `${deliveryAddressText}\n\n` +

        `*NEARBY LANDMARK*\n` +
        `${landmark.trim()}\n\n` +

        locationMessage +

        `*GOOGLE MAP LOCATION*\n` +
        `${googleMapsUrl}`;


      // SAVE ADDRESS

      saveCustomerAddress();


      // WHATSAPP

      const whatsappUrl =
        `https://wa.me/918008481192?text=` +
        `${encodeURIComponent(
          message
        )}`;

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );
    };


  // ==================================================
  // SCROLL TO MENU
  // ==================================================

  const scrollToMenu = () => {

    document
      .getElementById('menu')
      ?.scrollIntoView({
        behavior:
          'smooth',
      });
  };


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="min-h-screen overflow-x-hidden bg-[#080808] text-white">

      {/* ==================================================
            HEADER
        ================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl">

        <div className="mx-auto flex h-28 w-[calc(100%-28px)] max-w-6xl items-center justify-between sm:h-[72px] sm:w-[calc(100%-40px)]">

          <motion.button
            type="button"
            whileTap={{
              scale: 0.97,
            }}
            whileHover={{
              y: -1,
            }}
            onClick={() =>
              setIsInfoOpen(true)
            }
            aria-label="Open The Silent Food Critic information"
            className="group text-left leading-none outline-none"
          >

            <div className="text-xl font-black tracking-[0.08em] sm:text-xl">

              THE{' '}

              <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">

                SILENT

              </span>

            </div>

            <div className="mt-1.5 flex items-center gap-1 text-xs font-bold tracking-[0.3em] text-zinc-500 transition group-hover:text-amber-400 sm:text-[11px]">

              FOOD CRITIC

              <span className="ml-1 text-xs tracking-normal text-zinc-200 group-hover:text-amber-400">

                • INFO

              </span>

            </div>

          </motion.button>


          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            whileHover={{
              y: -1,
            }}
            onClick={() =>
              setIsCartOpen(true)
            }
            className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-3.5 text-lg font-extrabold text-black shadow-lg shadow-orange-500/10 sm:px-5 sm:py-3 sm:text-base"
          >

            <ShoppingCart
              size={24}
            />

            <span className="hidden sm:inline">
              Cart
            </span>

            {totalCount > 0 && (

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-1 text-sm font-bold text-white">

                {totalCount}

              </span>

            )}

          </motion.button>

        </div>

      </header>


      {/* ==================================================
            HERO
        ================================================== */}

      <section className="relative border-b border-white/[0.05] px-4 py-20 sm:px-6 sm:py-28 lg:py-32">

        <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-amber-500/[0.08] blur-[100px] sm:h-[500px] sm:w-[500px]" />

        <div className="relative mx-auto max-w-4xl text-center">

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-3 py-2 text-[10px] font-bold text-amber-400 sm:text-xs"
          >

            <MapPin size={14} />

            Vizag's Premier Fast Food Destination

          </motion.div>


          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="text-[42px] font-black leading-[1.02] tracking-[-2.5px] sm:text-6xl sm:tracking-[-3px] lg:text-7xl"
          >

            Craving Fresh

            <span className="mt-1 block bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent">

              Pizzas & Burgers?

            </span>

          </motion.h1>


          <motion.p
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="mx-auto mt-6 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base"
          >

            Good Food, Good Mood — Fresh Pizza,
            Burgers & Sandwiches delivered directly
            to your door.

          </motion.p>


          <motion.button
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.3,
            }}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={scrollToMenu}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-500 px-5 py-3 text-xs font-extrabold text-black shadow-xl shadow-orange-500/10 sm:px-6 sm:py-3.5 sm:text-sm"
          >

            Explore Menu

            <ArrowRight
              size={17}
            />

          </motion.button>

        </div>

      </section>


      {/* ==================================================
            MENU
        ================================================== */}

      <main
        id="menu"
        className="mx-auto w-[calc(100%-28px)] max-w-6xl py-14 sm:w-[calc(100%-40px)] sm:py-20"
      >

        <div className="mb-7">

          <div className="mb-6">

            <div className="mb-2 text-[10px] font-extrabold tracking-[0.2em] text-amber-400">

              OUR MENU

            </div>

            <h2 className="text-3xl font-black tracking-[-1px] sm:text-4xl">

              Something delicious

              <span className="text-zinc-600">

                {' '}for everyone.

              </span>

            </h2>

            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">

              Freshly prepared favorites made to
              satisfy every craving.

            </p>

          </div>


          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

            {categories.map(
              (category) => {

                const Icon =
                  category.icon;

                const isActive =
                  activeCategory ===
                  category.id;

                return (

                  <motion.button
                    key={
                      category.id
                    }
                    whileTap={{
                      scale: 0.95,
                    }}
                    onClick={() =>
                      setActiveCategory(
                        category.id
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all sm:px-4 ${
                      isActive
                        ? 'border-transparent bg-gradient-to-r from-amber-300 to-orange-500 text-black shadow-lg shadow-orange-500/10'
                        : 'border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >

                    <Icon
                      size={15}
                    />

                    {
                      category.name
                    }

                  </motion.button>

                );
              }
            )}

          </div>

        </div>


        <AnimatePresence
          mode="popLayout"
        >

          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          >

            {filteredItems.map(
              (
                item,
                index
              ) => (

                <FoodCard
                  key={item.id}
                  item={item}
                  onAdd={
                    addToCart
                  }
                  index={
                    index
                  }
                  quantity={getItemQuantity(
                    item.id
                  )}
                  onIncrease={() =>
                    addToCart(
                      item
                    )
                  }
                  onDecrease={() =>
                    updateQuantity(
                      item.id,
                      -1
                    )
                  }
                />

              )
            )}

          </motion.div>

        </AnimatePresence>

      </main>


      {/* ==================================================
            CART DRAWER
        ================================================== */}

      <AnimatePresence>

        {isCartOpen && (

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
            onClick={() =>
              setIsCartOpen(false)
            }
            className="fixed inset-0 z-[100] overflow-hidden bg-black/70 backdrop-blur-sm"
          >

            <motion.aside
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 260,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="absolute right-0 top-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#101010] shadow-2xl sm:w-[450px]"
            >

              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-5 sm:px-6">

                <div>

                  <div className="mb-1 text-[9px] font-extrabold tracking-[0.2em] text-amber-400">

                    YOUR ORDER

                  </div>

                  <h3 className="text-xl font-black sm:text-2xl">

                    Cart

                    <span className="ml-1 text-sm font-medium text-zinc-500">

                      ({totalCount})

                    </span>

                  </h3>

                </div>


                <button
                  onClick={() =>
                    setIsCartOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:text-white"
                >

                  <X size={19} />

                </button>

              </div>


              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

                <div className="px-4 py-4 sm:px-6">

                  {cart.length === 0 ? (

                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">

                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600">

                        <ShoppingBag
                          size={30}
                        />

                      </div>

                      <h4 className="font-bold">

                        Your cart is empty

                      </h4>

                      <p className="mt-1 max-w-[220px] text-xs leading-5 text-zinc-500">

                        Add something delicious from
                        our menu to get started.

                      </p>

                    </div>

                  ) : (

                    <div className="space-y-2.5">

                      {cart.map(
                        (item) => (

                          <motion.div
                            layout
                            key={
                              item.id
                            }
                            className="grid grid-cols-[58px_1fr_auto] gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5"
                          >

                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              className="h-[58px] w-[58px] rounded-lg object-cover"
                            />


                            <div className="min-w-0">

                              <h4 className="truncate text-xs font-bold text-zinc-200">

                                {
                                  item.name
                                }

                              </h4>

                              <div className="mt-1 text-xs font-bold text-amber-400">

                                ₹
                                {
                                  item.price
                                }

                              </div>


                              <div className="mt-2 flex w-fit items-center overflow-hidden rounded-lg border border-zinc-800">

                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      -1
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white"
                                >

                                  <Minus
                                    size={
                                      13
                                    }
                                  />

                                </button>


                                <span className="flex h-7 w-7 items-center justify-center text-xs font-bold text-white">

                                  {
                                    item.qty
                                  }

                                </span>


                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      1
                                    )
                                  }
                                  className="flex h-7 w-7 items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white"
                                >

                                  <Plus
                                    size={
                                      13
                                    }
                                  />

                                </button>

                              </div>

                            </div>


                            <div className="flex flex-col items-end justify-between">

                              <strong className="text-xs text-white">

                                ₹
                                {
                                  item.price *
                                  item.qty
                                }

                              </strong>


                              <button
                                onClick={() =>
                                  removeFromCart(
                                    item.id
                                  )
                                }
                                className="p-1 text-red-500 transition hover:text-red-400"
                              >

                                <Trash2
                                  size={
                                    15
                                  }
                                />

                              </button>

                            </div>

                          </motion.div>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* CHECKOUT */}

                {cart.length > 0 && (

                  <div className="border-t border-zinc-800 bg-[#0c0c0c] px-4 pb-8 pt-4 sm:px-6">

                    <div className="mb-4 flex items-center justify-between">

                      <span className="text-sm font-medium text-zinc-400">

                        Total Amount

                      </span>

                      <strong className="text-2xl font-black text-amber-400">

                        ₹
                        {
                          totalAmount
                        }

                      </strong>

                    </div>


                    {/* NAME */}

                    <div className="mb-3">

                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                        Your Name

                      </label>

                      <input
                        type="text"
                        value={
                          userName
                        }
                        onChange={(
                          e
                        ) =>
                          setUserName(
                            e.target.value
                          )
                        }
                        placeholder="Enter your name"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                      />

                    </div>


                    {/* PHONE NUMBER */}

                    <div className="mb-3">

                      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                        Phone Number{' '}

                        <span className="text-red-400">
                          *
                        </span>

                      </label>

                      <input
                        type="tel"
                        inputMode="numeric"
                        value={
                          phoneNumber
                        }
                        onChange={(
                          e
                        ) =>
                          setPhoneNumber(
                            e.target.value.replace(
                              /[^0-9]/g,
                              ''
                            ).slice(0, 10)
                          )
                        }
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={`w-full rounded-xl border bg-zinc-900 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 ${
                          phoneNumber.trim().length === 10
                            ? 'border-zinc-800 focus:border-amber-500'
                            : 'border-red-500/40 focus:border-red-400'
                        }`}
                      />

                      {phoneNumber.trim().length > 0 &&
                        phoneNumber.trim().length !== 10 && (

                          <p className="mt-1.5 text-[9px] leading-4 text-red-400">

                            ⚠️ Please enter a valid 10-digit
                            phone number.

                          </p>

                        )}

                    </div>


                    {/* ADDRESS OPTIONS */}

                    {savedAddresses.length > 0 && (

                      <div className="mb-3">

                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                          Delivery Address

                        </label>


                        <div className="grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() => {

                              setAddressMode(
                                'old'
                              );

                              if (
                                savedAddresses[0]
                              ) {

                                handleSelectOldAddress(
                                  savedAddresses[0]
                                );

                              }

                            }}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
                              addressMode ===
                              'old'
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                            }`}
                          >

                            <Home
                              size={
                                14
                              }
                            />

                            Old Address

                          </button>


                          <button
                            type="button"
                            onClick={
                              handleUseNewAddress
                            }
                            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${
                              addressMode ===
                              'new'
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                            }`}
                          >

                            <Navigation
                              size={
                                14
                              }
                            />

                            New Address

                          </button>

                        </div>

                      </div>

                    )}


                    {/* OLD ADDRESS LIST */}

                    {savedAddresses.length > 0 &&
                      addressMode === 'old' && (

                        <div className="mb-3 space-y-2">

                          {savedAddresses.map(
                            (
                              savedAddress,
                              index
                            ) => {

                              const savedText =
                                typeof savedAddress ===
                                  'string'
                                  ? savedAddress
                                  : savedAddress.address;

                              const savedLandmark =
                                typeof savedAddress ===
                                  'object' &&
                                savedAddress !== null
                                  ? savedAddress.landmark || ''
                                  : '';

                              const hasGPS =
                                typeof savedAddress ===
                                  'object' &&
                                savedAddress !==
                                  null &&
                                typeof savedAddress.latitude ===
                                  'number' &&
                                typeof savedAddress.longitude ===
                                  'number';

                              const isSelected =
                                selectedAddress ===
                                savedText;

                              return (

                                <div
                                  key={
                                    index
                                  }
                                  className={`flex items-stretch gap-2 rounded-xl border p-2 transition ${
                                    isSelected
                                      ? 'border-amber-500 bg-amber-500/10'
                                      : 'border-zinc-800 bg-zinc-900'
                                  }`}
                                >

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectOldAddress(
                                        savedAddress
                                      )
                                    }
                                    className="min-w-0 flex-1 rounded-lg p-1 text-left"
                                  >

                                    <div className="flex gap-2">

                                      <Home
                                        size={
                                          14
                                        }
                                        className="mt-0.5 shrink-0 text-amber-400"
                                      />

                                      <div className="min-w-0">

                                        <span
                                          className={`block text-xs leading-5 ${
                                            isSelected
                                              ? 'text-white'
                                              : 'text-zinc-400'
                                          }`}
                                        >

                                          {
                                            savedText
                                          }

                                        </span>


                                        {savedLandmark && (

                                          <div className="mt-1 text-[9px] leading-4 text-zinc-500">

                                            <span className="font-bold text-amber-400">
                                              Landmark:
                                            </span>{' '}

                                            {
                                              savedLandmark
                                            }

                                          </div>

                                        )}


                                        {hasGPS && (

                                          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-green-400">

                                            <LocateFixed
                                              size={
                                                11
                                              }
                                            />

                                            Exact location saved

                                          </div>

                                        )}

                                      </div>

                                    </div>

                                  </button>


                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveOldAddress(
                                        savedAddress
                                      )
                                    }
                                    className="flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300 active:scale-95"
                                    title="Remove saved address"
                                    aria-label="Remove saved address"
                                  >

                                    <Trash2
                                      size={
                                        14
                                      }
                                    />

                                  </button>

                                </div>

                              );
                            }
                          )}

                        </div>

                      )}


                    {/* SELECTED OLD ADDRESS */}

                    {addressMode ===
                      'old' &&
                      address && (

                        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3">

                          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-amber-400">

                            <CheckCircle2
                              size={
                                13
                              }
                            />

                            Selected Address

                          </div>


                          <p className="text-xs leading-5 text-zinc-300">

                            {
                              address
                            }

                          </p>


                          {landmark && (

                            <div className="mt-2 rounded-lg border border-amber-500/10 bg-amber-500/5 p-2">

                              <div className="text-[9px] font-bold uppercase tracking-wide text-amber-400">

                                Nearby Landmark

                              </div>

                              <p className="mt-1 text-xs text-zinc-300">

                                {
                                  landmark
                                }

                              </p>

                            </div>

                          )}


                          {!landmark && (

                            <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2">

                              <div className="text-[9px] font-bold text-red-400">

                                ⚠️ Nearby landmark required

                              </div>

                              <p className="mt-1 text-[9px] leading-4 text-zinc-500">

                                Please enter a landmark below before placing the order.

                              </p>

                            </div>

                          )}


                          {deliveryCoordinates ? (

                            <>

                              <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-green-400">

                                <LocateFixed
                                  size={
                                    11
                                  }
                                />

                                Exact GPS location saved

                              </div>


                              <button
                                type="button"
                                onClick={
                                  handleOpenMap
                                }
                                className="mt-2 flex items-center gap-1 text-[9px] font-bold text-amber-400 transition hover:text-amber-300"
                              >

                                <MapPinned
                                  size={
                                    11
                                  }
                                />

                                Change exact location

                              </button>

                            </>

                          ) : (

                            <div className="mt-2">

                              <div className="flex items-center gap-1 text-[9px] text-zinc-500">

                                <MapPin
                                  size={
                                    11
                                  }
                                />

                                Exact map location is optional.

                              </div>


                              <button
                                type="button"
                                onClick={
                                  handleOpenMap
                                }
                                className="mt-2 flex items-center gap-1 text-[9px] font-bold text-amber-400 transition hover:text-amber-300"
                              >

                                <MapPinned
                                  size={
                                    11
                                  }
                                />

                                Pick exact location

                              </button>

                            </div>

                          )}

                        </div>

                      )}


                    {/* ==================================================
                          NEW ADDRESS
                        ================================================== */}

                    {addressMode ===
                      'new' && (

                        <div className="mb-3">

                          <div className="mb-1.5 flex items-center justify-between gap-2">

                            <label className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                              New Delivery Address

                            </label>


                            <button
                              type="button"
                              onClick={
                                handleUseMyLocation
                              }
                              disabled={
                                isLocating
                              }
                              className={`flex shrink-0 items-center gap-1 text-[9px] font-bold transition ${
                                isLocating
                                  ? 'cursor-not-allowed text-zinc-600'
                                  : 'text-amber-400 hover:text-amber-300'
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
                                    size={
                                      12
                                    }
                                  />

                                </motion.span>

                              ) : (

                                <LocateFixed
                                  size={
                                    12
                                  }
                                />

                              )}

                              {isLocating
                                ? 'Locating...'
                                : 'Use My Location'}

                            </button>

                          </div>


                          {/* ADDRESS INPUT */}

                          <input
                            type="text"
                            value={
                              address
                            }
                            onChange={(e) =>
                              handleManualAddressChange(
                                e.target.value
                              )
                            }
                            placeholder="Enter your complete delivery address..."
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                          />


                          {/* LANDMARK INPUT */}

                          <div className="mt-3">

                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                              Nearby Landmark{' '}

                              <span className="text-red-400">
                                *
                              </span>

                            </label>


                            <input
                              type="text"
                              value={
                                landmark
                              }
                              onChange={(e) =>
                                handleManualLandmarkChange(
                                  e.target.value
                                )
                              }
                              placeholder="Near Hanuman Temple, Beside ABC School..."
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
                            />


                            <p className="mt-1.5 text-[9px] leading-4 text-zinc-600">

                              A nearby landmark is required
                              to help us find your delivery
                              location.

                            </p>

                          </div>


                          {/* MAP BUTTON */}

                          <button
                            type="button"
                            onClick={
                              handleOpenMap
                            }
                            disabled={
                              isLocating
                            }
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-[9px] font-bold text-zinc-300 transition hover:border-amber-500 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <MapPinned
                              size={
                                13
                              }
                            />

                            Pick Exact Location

                          </button>


                          {locationStatus && (

                            <div
                              className={`mt-2 flex items-start gap-1.5 text-[9px] ${
                                deliveryCoordinates
                                  ? 'text-green-400'
                                  : 'text-zinc-500'
                              }`}
                            >

                              {deliveryCoordinates ? (

                                <CheckCircle2
                                  size={
                                    13
                                  }
                                  className="mt-0.5 shrink-0"
                                />

                              ) : (

                                <MapPin
                                  size={
                                    13
                                  }
                                  className="mt-0.5 shrink-0"
                                />

                              )}

                              <span>

                                {
                                  locationStatus
                                }

                              </span>

                            </div>

                          )}


                          {deliveryCoordinates && (

                            <div className="mt-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3">

                              <div className="flex items-center gap-2 text-[10px] font-bold text-green-400">

                                <LocateFixed
                                  size={
                                    13
                                  }
                                />

                                Exact delivery location selected

                              </div>


                              <div className="mt-1 text-[9px] leading-4 text-zinc-500">

                                Latitude:{' '}

                                {
                                  deliveryCoordinates.latitude
                                }

                                <br />

                                Longitude:{' '}

                                {
                                  deliveryCoordinates.longitude
                                }

                              </div>


                              <button
                                type="button"
                                onClick={
                                  handleOpenMap
                                }
                                className="mt-2 flex items-center gap-1 text-[9px] font-bold text-amber-400 hover:text-amber-300"
                              >

                                <MapPinned
                                  size={
                                    11
                                  }
                                />

                                Change exact location

                              </button>

                            </div>

                          )}

                        </div>

                      )}


                    {/* LANDMARK FIELD FOR OLD ADDRESS */}

                    {addressMode === 'old' &&
                      address && (

                        <div className="mb-3">

                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-zinc-500">

                            Nearby Landmark{' '}

                            <span className="text-red-400">
                              *
                            </span>

                          </label>


                          <input
                            type="text"
                            value={
                              landmark
                            }
                            onChange={(e) =>
                              handleManualLandmarkChange(
                                e.target.value
                              )
                            }
                            placeholder="Near Hanuman Temple, Beside ABC School..."
                            className={`w-full rounded-xl border bg-zinc-900 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-600 ${
                              landmark.trim()
                                ? 'border-zinc-800 focus:border-amber-500'
                                : 'border-red-500/40 focus:border-red-400'
                            }`}
                          />


                          {!landmark.trim() && (

                            <p className="mt-1.5 text-[9px] leading-4 text-red-400">

                              ⚠️ Nearby landmark is required
                              before placing the order.

                            </p>

                          )}

                        </div>

                      )}


                    {/* LOCATION INFORMATION */}

                    {addressMode === 'new' &&
                      !deliveryCoordinates &&
                      address.trim() && (

                        <div className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">

                          <div className="flex gap-2">

                            <MapPin
                              size={
                                14
                              }
                              className="mt-0.5 shrink-0 text-zinc-500"
                            />

                            <p className="text-[9px] leading-4 text-zinc-500">

                              Enter your address and click
                              <span className="font-bold text-zinc-300">
                                {' '}Pick Exact Location
                              </span>
                              {' '}to find the area on the map.
                              You can then drag the pin to your
                              exact house.

                            </p>

                          </div>

                        </div>

                      )}


                    {/* ORDER BUTTON */}

                    <motion.button
                      whileTap={{
                        scale: 0.98,
                      }}
                      whileHover={{
                        y: -1,
                      }}
                      onClick={
                        handleSendOrder
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-500 py-3 text-[10px] font-black text-black shadow-lg shadow-orange-500/10 sm:py-3.5 sm:text-xs"
                    >

                      SEND ORDER ON WHATSAPP

                      <ArrowRight
                        size={
                          15
                        }
                      />

                    </motion.button>

                  </div>

                )}

              </div>

            </motion.aside>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ==================================================
            BRAND / CONTACT POPUP
        ================================================== */}

      <AnimatePresence>

        {isInfoOpen && (

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
            onClick={() =>
              setIsInfoOpen(false)
            }
            className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden bg-black/75 px-4 py-6 backdrop-blur-md"
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 15,
                scale: 0.96,
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 280,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden overscroll-contain rounded-3xl border border-zinc-800 bg-[#101010] shadow-2xl shadow-black/50"
            >

              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/10 blur-[70px]" />


              <div className="relative shrink-0 border-b border-zinc-800 px-5 pb-5 pt-6 sm:px-6">

                <button
                  type="button"
                  onClick={() =>
                    setIsInfoOpen(false)
                  }
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500 transition hover:text-white"
                  aria-label="Close information"
                >

                  <X size={17} />

                </button>


                <div className="pr-10">

                  <div className="mb-2 text-[9px] font-extrabold tracking-[0.25em] text-amber-400">

                    ORDER & CONTACT

                  </div>

                  <h2 className="text-2xl font-black tracking-[-0.8px] sm:text-3xl">

                    THE{' '}

                    <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">

                      SILENT

                    </span>

                    <span className="block text-zinc-300">

                      FOOD CRITIC

                    </span>

                  </h2>

                  <p className="mt-3 max-w-sm text-xs leading-5 text-zinc-500">

                    Direct ordering. Fast response.
                    Fresh food.

                  </p>

                </div>

              </div>


              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">

                <div className="space-y-3">

                  {/* WHATSAPP */}

                  <a
                    href="https://wa.me/918008481192"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-green-500/40 hover:bg-zinc-900"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">

                      <MessageCircle
                        size={20}
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">

                        WhatsApp

                      </div>

                      <div className="mt-1 text-sm font-black text-white">

                        8008481192

                      </div>

                      <div className="mt-1 text-[9px] font-bold text-green-400">

                        CHAT NOW →

                      </div>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-green-400"
                    />

                  </a>


                  {/* INSTAGRAM */}

                  <a
                    href="https://instagram.com/the_silent_food_critic"
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-pink-500/40 hover:bg-zinc-900"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">

                      <span className="text-xl font-black leading-none">
                        ◎
                      </span>

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">

                        Instagram

                      </div>

                      <div className="mt-1 break-all text-sm font-black text-white">

                        @the_silent_food_critic

                      </div>

                      <div className="mt-1 text-[9px] font-bold text-pink-400">

                        FOLLOW US →

                      </div>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-pink-400"
                    />

                  </a>


                  {/* EMAIL */}

                  <a
                    href="mailto:thesilentfoodc@gmail.com"
                    className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-amber-500/40 hover:bg-zinc-900"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">

                      <Mail
                        size={20}
                      />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">

                        Email

                      </div>

                      <div className="mt-1 break-all text-sm font-black text-white">

                        thesilentfoodc@gmail.com

                      </div>

                      <div className="mt-1 text-[9px] font-bold text-amber-400">

                        SEND EMAIL →

                      </div>

                    </div>

                    <ArrowRight
                      size={15}
                      className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-amber-400"
                    />

                  </a>


                  {/* ADDRESS */}

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">

                    <div className="flex gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">

                        <MapPin
                          size={20}
                        />

                      </div>

                      <div className="min-w-0">

                        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">

                          Address

                        </div>

                        <div className="mt-2 text-xs leading-5 text-zinc-300">

                          Kakaralova, Jai Andhra Colony
                          <br />
                          Near Hanuman Temple
                          <br />
                          Vizag – 530005

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* BRAND FOOTER */}

                  <div className="border-t border-zinc-800 pt-4 text-center">

                    <div className="text-[10px] font-black tracking-[0.12em] text-zinc-500">

                      THE SILENT FOOD CRITIC

                    </div>

                    <div className="mt-2 text-[9px] font-bold tracking-wide text-zinc-600">

                      Freshly made • Great taste • Worth every bite

                    </div>

                  </div>

                </div>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>


      {/* ==================================================
            MAP PICKER MODAL
        ================================================== */}

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
                        handleMapLocationSelect
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

                            handleMapLocationSelect(
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
                    handleUseCurrentLocation
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
                      handleConfirmMapLocation
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

    </div>
  );
}