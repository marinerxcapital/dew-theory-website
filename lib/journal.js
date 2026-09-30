/**
 * Dew Theory Journal — editorial content.
 *
 * This is the journal's content source. It is intentionally a plain module
 * rather than a CMS stub: the site has no CMS, and the alternative would be to
 * invent a second content system.
 *
 * Content rules (enforced by tests/journal.test.mjs):
 *   - no dates, because none were supplied and a fabricated publish date is a
 *     false claim;
 *   - no medical claims, diagnoses or treatment promises;
 *   - no product claims beyond what the catalog records already state;
 *   - no unverifiable business facts (addresses, hours, credentials, awards).
 *
 * The owner can replace or extend entries freely; the shape is deliberately
 * simple.
 */

export const JOURNAL_ENTRIES = [
  {
    slug: 'order-of-operations',
    topic: 'Routine',
    edition: 'Edition 01',
    title: 'Order of operations',
    dek: 'The sequence matters more than the shelf. Thinnest to thickest, water before oil, actives where they can actually work.',
    body: [
      {
        p: 'A routine is a sequence, not a collection. Applied in the wrong order, two good products can cancel each other out — a rich cream before a serum physically blocks it from reaching the skin, and an occlusive layer over a treatment slows the thing you wanted to happen.'
      },
      {
        p: 'The working rule is consistency of texture. Move from the thinnest, most fluid product to the thickest, most occlusive one, and let each layer settle for a moment before the next.'
      },
      {
        h: 'The order that holds up'
      },
      {
        list: [
          'Cleanse — and double cleanse in the evening if you wore SPF or makeup.',
          'Tone, if your toner is a treatment step rather than a freshener.',
          'Serum or treatment — this is where actives live, on clean skin, closest to the surface.',
          'Moisturiser — to hold water in and support the barrier the actives just worked on.',
          'SPF in the morning, as the final step, every day.'
        ]
      },
      {
        p: 'Morning and evening are not mirror images. Evening is the better home for exfoliating or renewing products, because sun exposure and the rest of the day are no longer stacked against them. Morning is the better home for antioxidants and protection.'
      },
      {
        h: 'Where people usually go wrong'
      },
      {
        p: 'Two habits cause most of the trouble. The first is layering several actives at once and then treating the resulting irritation as a reason to add a soothing product — which is a third layer on a problem caused by the first two. The second is skipping moisturiser because a serum "already feels like enough". A serum is a treatment; it is not a barrier.'
      },
      {
        p: 'If you are rebuilding a routine, start with the boring parts — cleanse, moisturise, protect — and add one active at a time.'
      }
    ]
  },
  {
    slug: 'introducing-an-active',
    topic: 'Barrier',
    edition: 'Edition 02',
    title: 'Introducing an active without wrecking your barrier',
    dek: 'Frequency, not concentration, is the variable most people get wrong. Starting slow is not caution — it is the method.',
    body: [
      {
        p: 'A new active rarely fails because the percentage was too low. It fails because it was introduced every day, alongside two other new things, on skin that had no chance to adapt.'
      },
      {
        h: 'Start below the label'
      },
      {
        p: 'Whatever the product recommends, start with less. One application, then two nights off. If nothing happens, move to every third night, then every other night. Most skin will tell you within a fortnight whether the pace is right.'
      },
      {
        h: 'Signs it is working'
      },
      {
        list: [
          'Texture and tone settle gradually over weeks, not days.',
          'Skin feels normal the morning after application — not tight, not hot.',
          'The rest of your routine still applies without stinging.'
        ]
      },
      {
        h: 'Signs to stop'
      },
      {
        list: [
          'Persistent stinging, burning or swelling — stop and let the skin settle.',
          'Flaking that continues past the first fortnight.',
          'Any reaction you would not want to repeat tomorrow.'
        ]
      },
      {
        p: 'When something goes wrong, the fix is almost always subtraction: remove the new active, keep the barrier steps, and wait. Adding products to calm a reaction you caused with products is how a two-step problem becomes a six-step routine.'
      }
    ]
  },
  {
    slug: 'dry-or-dehydrated',
    topic: 'Foundation',
    edition: 'Edition 03',
    title: 'Dry or dehydrated? They are not the same',
    dek: 'One is about oil, the other is about water. They feel similar, they overlap, and they respond to different things.',
    body: [
      {
        p: 'Dry skin is short on oil. Dehydrated skin is short on water. You can be either, both, or neither — and oily skin can absolutely be dehydrated, which is where most confusing advice starts.'
      },
      {
        h: 'How they usually present'
      },
      {
        list: [
          'Dry: rough or flaky texture, tightness after cleansing, a dull finish with no shine.',
          'Dehydrated: fine lines that appear and disappear, a look of tightness with shine, oil sitting on top of skin that still feels parched.'
        ]
      },
      {
        p: 'The distinction matters because the response is different. Dehydration is addressed by holding water in — humectants first, then something to seal them. Dryness is addressed by replenishing lipids and supporting the barrier.'
      },
      {
        h: 'A practical test'
      },
      {
        p: 'Cleanse, wait an hour, and touch your face without applying anything. If it feels tight but you can see shine, you are likely looking at dehydration. If it feels rough and looks flat all over, oil is probably the missing piece.'
      },
      {
        p: 'Neither one needs a twelve-step routine. Both need the barrier steps done properly before anything more interesting is added.'
      }
    ]
  },
  {
    slug: 'the-step-that-protects-the-rest',
    topic: 'Protection',
    edition: 'Edition 04',
    title: 'The step that protects the rest',
    dek: 'Every result the rest of your routine earns is being spent by daylight. SPF is the least glamorous and most consequential step.',
    body: [
      {
        p: 'It is easy to think of sunscreen as the last, optional entry on a list — the one you skip when you are in a hurry. In practice it is the step that decides whether the work you did in the evening survives the day.'
      },
      {
        h: 'Why it is first in importance'
      },
      {
        list: [
          'Daylight exposure is constant, not seasonal. Cloud and glass do not remove it.',
          'Uneven tone and early lines are the visible outcome of cumulative exposure.',
          'Actives that renew skin make protection more important, not less.'
        ]
      },
      {
        h: 'Making it stick'
      },
      {
        p: 'The best sunscreen is the one you will actually reapply. Choose a texture you do not mind wearing, put it on as the final step of the morning routine, and keep a second one where you will see it. Amount matters more than the number on the bottle.'
      },
      {
        p: 'If an SPF pills under makeup or feels heavy, that is a formulation question — not a reason to skip the step.'
      }
    ]
  }
];

export function getAllJournalEntries() {
  return JOURNAL_ENTRIES;
}

export function getJournalEntry(slug) {
  return JOURNAL_ENTRIES.find((e) => e.slug === slug) || null;
}

export function getJournalTopics() {
  return [...new Set(JOURNAL_ENTRIES.map((e) => e.topic))];
}
