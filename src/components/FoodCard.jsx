import {
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react';

import { motion } from 'framer-motion';

export default function FoodCard({
  item,
  onAdd,
  onIncrease,
  onDecrease,
  quantity = 0,
  index = 0,
}) {
  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -5,
      }}
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-[#101010] shadow-lg shadow-black/10"
    >

      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-zinc-800 sm:h-56">

        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* CATEGORY */}

        <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/60 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-white backdrop-blur-md">
          {item.category}
        </div>

        {/* VEG / NON-VEG */}

        <div
          className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border bg-black/65 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide backdrop-blur-md ${
            item.type === 'veg'
              ? 'border-green-500/30 text-green-400'
              : 'border-red-500/30 text-red-400'
          }`}
        >
          <span
            className={`flex h-3 w-3 items-center justify-center rounded-sm border ${
              item.type === 'veg'
                ? 'border-green-500'
                : 'border-red-500'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                item.type === 'veg'
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
          </span>

          {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-4 sm:p-5">

        <h3 className="text-base font-extrabold text-white sm:text-lg">
          {item.name}
        </h3>

        {/* COMBO ITEMS */}

        {item.items && (

          <ul className="mt-2 space-y-1 text-[10px] leading-4 text-zinc-500 sm:text-xs">

            {item.items.map(
              (food, index) => (

                <li
                  key={index}
                  className="flex items-center gap-1.5"
                >

                  <span className="h-1 w-1 rounded-full bg-amber-500" />

                  {food}

                </li>

              )
            )}

          </ul>

        )}

        {/* PRICE + QUANTITY */}

        <div className="mt-5 flex items-end justify-between gap-3">

          <div>

            <div className="text-[8px] font-bold uppercase tracking-wider text-zinc-600">
              Starting from
            </div>

            <div className="mt-0.5 text-xl font-black text-amber-400 sm:text-2xl">
              ₹{item.price}
            </div>

          </div>

          {/* QUANTITY CONTROL */}

          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => onAdd(item)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-300 to-orange-500 px-3 py-2.5 text-[11px] font-black text-black shadow-md shadow-orange-500/10 sm:px-4"
            >
              <ShoppingBag size={14} />

              Add

              <Plus size={14} />
            </motion.button>
          ) : (
            <div className="flex items-center overflow-hidden rounded-xl border border-amber-500/30 bg-amber-500/10">

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDecrease}
                className="flex h-10 w-10 items-center justify-center text-amber-400 hover:bg-amber-500/10"
              >
                <Minus size={15} />
              </motion.button>

              <span className="flex h-10 min-w-8 items-center justify-center text-sm font-black text-white">
                {quantity}
              </span>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onIncrease}
                className="flex h-10 w-10 items-center justify-center text-amber-400 hover:bg-amber-500/10"
              >
                <Plus size={15} />
              </motion.button>

            </div>
          )}

        </div>

      </div>

    </motion.article>
  );
}