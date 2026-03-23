/**
 * Seed script — migrates the original 91 legacy events into the new schema.
 * Run with: npm run db:seed
 */
import { PrismaClient, EventType, SourceType } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Legacy event data ────────────────────────────────────────────────────────

interface LegacyEvent {
  id: string;
  name: string;
  type: string;
  month: number;
  day?: number;
  endDay?: number;
  endMonth?: number;
  location: string;
  region: string;
  lat: number;
  lng: number;
  popularity: number;
  description: string;
  bestTime: string;
  photoTip: string;
  url?: string;
}

const legacyTypeMap: Record<string, EventType> = {
  festival: "FESTIVAL",
  custom:   "CUSTOM",
  nature:   "NATURE",
  cultural: "CULTURAL",
  religious:"RELIGIOUS",
  sport:    "SPORT",
  market:   "MARKET",
  royal:    "ROYAL",
  protest:  "PROTEST",
  parade:   "PARADE",
  vigil:    "VIGIL",
  fair:     "FAIR",
};

function toDate(year: number, month: number, day = 1): Date {
  return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00Z`);
}

// ─── Events ───────────────────────────────────────────────────────────────────

const YEAR = 2026;

const legacyEvents: LegacyEvent[] = [
  // JANUARY
  { id:"hogmanay-edinburgh", name:"Edinburgh Hogmanay", type:"festival", month:1, day:1, location:"Edinburgh", region:"Scotland", lat:55.9533, lng:-3.1883, popularity:5, description:"Scotland's world-famous New Year street party fills Edinburgh's Old Town with torchlight processions, fireworks over the castle, and tens of thousands of revellers.", bestTime:"Midnight for fireworks; torchlight procession from 8pm", photoTip:"Use a tripod and 10–20s exposures to paint torch trails against the castle skyline.", url:"https://www.edinburghshogmanay.com" },
  { id:"up-helly-aa", name:"Up Helly Aa", type:"festival", month:1, location:"Lerwick, Shetland", region:"Scotland", lat:60.155, lng:-1.145, popularity:4, description:"Europe's largest fire festival sees 1,000 torch-carrying Vikings march through Lerwick before burning a full-scale longship on the last Tuesday of January.", bestTime:"Dusk procession and ship-burning around 7:30pm", photoTip:"Set ISO 1600–3200 with a fast prime; the torches throw warm directional light perfect for portrait-style shots of the Guizer Jarl.", url:"https://www.uphellyaa.org" },
  { id:"burns-night", name:"Burns Night Celebrations", type:"cultural", month:1, day:25, location:"Alloway, Ayrshire", region:"Scotland", lat:55.4565, lng:-4.6268, popularity:3, description:"Celebrations of Scotland's national poet on his birthday, with pipe bands, haggis suppers, and public processions near the original Burns Cottage.", bestTime:"Evening candlelit events from 6pm", photoTip:"Candlelight provides warm, intimate light — shoot wide open (f/1.8–2.8) and embrace the moody shadows." },
  { id:"red-kite-feeding-wales", name:"Red Kite Feeding Station", type:"nature", month:1, location:"Rhayader, Wales", region:"Wales", lat:52.2996, lng:-3.5101, popularity:3, description:"Gigrin Farm draws up to 600 red kites daily at 2pm, creating a spectacle of aerial acrobatics. Purpose-built photography hides allow incredible close-up shots.", bestTime:"2pm daily (3pm in summer) when food is put out", photoTip:"From the photography hide, use a 500mm lens at 1/2000s to freeze kites mid-dive with outstretched forked tails." },
  { id:"norfolk-broads-winter-sunrise", name:"Norfolk Broads Winter Sunrise", type:"nature", month:1, location:"Horning, Norfolk", region:"East of England", lat:52.7077, lng:1.4613, popularity:3, description:"The Norfolk Broads in winter offer atmospheric waterscape photography, with windmills, reed beds, and wherries silhouetted against vivid dawn skies.", bestTime:"Dawn on clear, cold January mornings", photoTip:"How Hill windpump is a classic Broads subject — shoot from the water's edge at dawn to mirror a frost-pink sky." },
  { id:"snowdonia-winter-landscape", name:"Snowdonia Winter Landscape", type:"nature", month:1, location:"Snowdon, Wales", region:"Wales", lat:53.0685, lng:-4.0768, popularity:4, description:"When Snowdon receives snow, temperature inversions create cloud seas below the summit with Welsh peaks as islands — extraordinary landscape photography.", bestTime:"Clear dawn after overnight snowfall; winter inversions best Dec–Feb", photoTip:"A temperature inversion below the summit gives a cloud-sea image at sunrise — arrive before first light via the Ranger or Llanberis path." },
  { id:"celtic-connections-glasgow", name:"Celtic Connections", type:"festival", month:1, location:"Glasgow", region:"Scotland", lat:55.8617, lng:-4.2583, popularity:3, description:"The world's largest Celtic music festival fills Glasgow's venues for three weeks in January with traditional music from Scotland, Ireland, Brittany, and beyond.", bestTime:"Evening concerts and late-night pub sessions", photoTip:"The Old Fruitmarket venue has beautiful cast-iron architecture — shoot wide to include the building's character alongside performers." },
  { id:"mari-lwyd", name:"Mari Lwyd", type:"custom", month:1, location:"Llangynwyd, Wales", region:"Wales", lat:51.5744, lng:-3.6291, popularity:3, description:"An ancient Welsh midwinter folk custom where a decorated horse skull mounted on a pole is paraded door-to-door, with wassailers engaging in a sung battle of wits. The ghostly white skull and ribbon-decked procession are extraordinary to photograph.", bestTime:"Evening processions from dusk in late December to early January", photoTip:"Use flash fill in low light to illuminate the skull's white ribbons against dark winter streets — the contrast is dramatic." },
  // FEBRUARY
  { id:"chinese-new-year-london", name:"Chinese New Year — London", type:"cultural", month:2, location:"Chinatown, London", region:"London", lat:51.5118, lng:-0.1296, popularity:5, description:"London's Chinatown hosts Europe's largest Chinese New Year celebration, with dragon parades, lion dances, red lanterns, and firecracker smoke filling Gerrard Street.", bestTime:"Midday parade for bright colour; evening for lantern glow", photoTip:"Use continuous burst mode to capture dragon dancers mid-leap and freeze cascading firecracker smoke.", url:"https://www.visitlondon.com/things-to-do/whats-on/special-events/chinese-new-year" },
  { id:"snowdrop-season", name:"Snowdrop Season — Welford Park", type:"nature", month:2, location:"Welford Park, Berkshire", region:"South East", lat:51.4416, lng:-1.4256, popularity:3, description:"Welford Park hosts one of England's most spectacular snowdrop displays, with woodland carpeted in white beneath bare beech trees in delicate winter light.", bestTime:"Mid-morning on overcast days for even, shadowless light", photoTip:"Get low to shoot snowdrops against the sky — a beanbag or ground spike lets you work at flower level." },
  { id:"york-viking-festival", name:"Jorvik Viking Festival", type:"cultural", month:2, location:"York", region:"Yorkshire", lat:53.9601, lng:-1.0845, popularity:3, description:"Europe's largest Viking festival takes over York's medieval streets with longship processions, combat re-enactments, and full Norse costume throughout the city.", bestTime:"Morning processions along the Ouse; combat displays at midday", photoTip:"Photograph Viking re-enactors against medieval gateways (Micklegate Bar) — the stone archways frame warriors perfectly." },
  { id:"imbolc-glastonbury", name:"Imbolc at Glastonbury", type:"religious", month:2, day:1, location:"Glastonbury, Somerset", region:"South West", lat:51.1458, lng:-2.7168, popularity:2, description:"The ancient Celtic festival of Imbolc, marking the first stirrings of spring, is celebrated at Glastonbury Tor with candle ceremonies and dawn gatherings.", bestTime:"Dawn on 1 February for mist and golden light on the Tor", photoTip:"Arrive before sunrise and shoot from the base of the Tor — low mist often pools in the Somerset Levels below." },
  // MARCH
  { id:"st-davids-day", name:"St David's Day Parade", type:"cultural", month:3, day:1, location:"Cardiff", region:"Wales", lat:51.4816, lng:-3.1791, popularity:4, description:"Wales's national day is marked by a colourful parade through Cardiff city centre, with children in traditional dress, daffodils, and red dragon flags from every building.", bestTime:"Mid-morning parade, around 11am", photoTip:"The vivid red of Welsh costume pops against Cardiff's Victorian stone buildings — use spot metering on faces." },
  { id:"st-patricks-day-belfast", name:"St Patrick's Day Festival", type:"festival", month:3, day:17, location:"Belfast", region:"Northern Ireland", lat:54.5973, lng:-5.9301, popularity:4, description:"Belfast's carnival features spectacular street theatre, giant puppets, and a city-wide parade that rivals Dublin's in scale and colour.", bestTime:"Morning parade from 11am; evening street theatre until dark", photoTip:"Shoot the giant carnival puppets from street level with a wide-angle lens to emphasise their scale against city buildings.", url:"https://belfastcity.gov.uk/st-patricks-day" },
  { id:"oxford-cambridge-boat-race", name:"Oxford vs Cambridge Boat Race", type:"sport", month:3, location:"Thames, London", region:"London", lat:51.4869, lng:-0.2286, popularity:4, description:"The annual university rowing race from Putney to Mortlake on the Thames draws enormous crowds on a Saturday in late March or early April.", bestTime:"Early afternoon race start for golden riverside light", photoTip:"Position on Hammersmith Bridge for a birds-eye view of boats passing beneath with the river curving away behind.", url:"https://www.theboatrace.org" },
  { id:"holi-festival-london", name:"Holi Festival of Colours", type:"religious", month:3, location:"London", region:"London", lat:51.5, lng:-0.1, popularity:3, description:"London celebrates Holi with joyful colour powder throwing, music, and dancing in parks across the city. The explosion of coloured powder in sunlight creates vivid photography.", bestTime:"Midday to 3pm when colour explosions are most intense", photoTip:"Back-light colour powder with the sun behind participants and freeze powder clouds at 1/1000s — rim light makes colours ignite." },
  { id:"spring-equinox-stonehenge", name:"Spring Equinox at Stonehenge", type:"religious", month:3, day:20, location:"Stonehenge, Wiltshire", region:"South West", lat:51.1789, lng:-1.8262, popularity:4, description:"English Heritage opens Stonehenge for open access at the spring equinox, when sunrise aligns with the stones. Druids, pagans, and photographers gather to mark the balance of day and night.", bestTime:"Sunrise around 6:15am on 20 March", photoTip:"Shoot the rising sun framed between the uprights of the Great Trilithon with druids silhouetted below.", url:"https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/solstice-and-equinox/" },
  { id:"spring-lambs-yorkshire-dales", name:"Spring Lambing — Yorkshire Dales", type:"nature", month:3, location:"Hawes, North Yorkshire", region:"Yorkshire", lat:54.3109, lng:-2.1985, popularity:3, description:"The Yorkshire Dales in late March are alive with newborn lambs in stone-walled pastures, with limestone scars and ancient barns as backdrop. A classically rural English photography subject.", bestTime:"Mid-morning in late March when lambs are most active", photoTip:"Get low to lamb height with a 70–200mm telephoto — stone walls create a natural frame and the Dales provide soft pastel backgrounds." },
  // APRIL
  { id:"beltane-fire-festival-edinburgh", name:"Beltane Fire Festival", type:"festival", month:4, day:30, location:"Calton Hill, Edinburgh", region:"Scotland", lat:55.9469, lng:-3.1857, popularity:4, description:"On the eve of May Day, Calton Hill transforms into a scene of ancient Celtic fire ritual with drummers, fire performers, the May Queen, and hundreds of torches.", bestTime:"After 9pm when darkness falls and fire performances begin", photoTip:"A 30-second exposure on a tripod blends moving fire performers into painterly streaks against the static city skyline.", url:"https://beltane.org" },
  { id:"bluebells-spring", name:"Bluebell Woods", type:"nature", month:4, location:"Micheldever Wood, Hampshire", region:"South East", lat:51.1878, lng:-1.2283, popularity:4, description:"British bluebells carpet ancient woodland floors in mid to late April, creating violet-blue seas beneath fresh green canopies.", bestTime:"Overcast mornings for saturated colour without harsh shadows", photoTip:"Shoot at f/2.8–4 to blur the carpet into a dreamy wash of colour while keeping near flowers sharp." },
  { id:"aintree-grand-national", name:"Aintree Grand National", type:"sport", month:4, location:"Liverpool", region:"North West", lat:53.4772, lng:-2.9437, popularity:5, description:"The world's most famous horse race attracts 70,000 spectators in elaborate fashion to Aintree Racecourse every April. The extraordinary hats and mid-fence action are iconic.", bestTime:"Race day afternoon; morning enclosures for fashion portraits", photoTip:"A 400mm telephoto is essential to fill the frame with horse and jockey clearing Becher's Brook at speed.", url:"https://www.aintree.co.uk" },
  { id:"london-marathon", name:"London Marathon", type:"sport", month:4, location:"London", region:"London", lat:51.5009, lng:-0.0065, popularity:5, description:"One of the world's great marathons takes 40,000 runners through London's most iconic landmarks every April. The Tower Bridge crossing is the most photogenic moment.", bestTime:"Elite men's wave passes Tower Bridge at approximately 10:30am", photoTip:"Shoot the Tower Bridge crossing from the north approach with a 300–500mm lens to compress the field of runners framed by the Gothic towers.", url:"https://www.londonmarathon.co.uk" },
  { id:"whitby-goth-weekend-april", name:"Whitby Goth Weekend (Spring)", type:"festival", month:4, location:"Whitby, North Yorkshire", region:"Yorkshire", lat:54.4857, lng:-0.6144, popularity:4, description:"Thousands of goths descend on Bram Stoker's Whitby in elaborate Victorian and gothic costumes — the abbey ruins, graveyard, and harbour create Gothic portraiture of incomparable quality.", bestTime:"Late afternoon for abbey silhouettes; twilight at the graveyard", photoTip:"Ask costumed attendees to pose at the abbey entrance at blue hour — the stone arch frames them perfectly against a deep blue sky.", url:"https://www.whitbygothweekend.co.uk" },
  // MAY
  { id:"chelsea-flower-show", name:"RHS Chelsea Flower Show", type:"cultural", month:5, location:"Chelsea, London", region:"London", lat:51.4888, lng:-0.1574, popularity:5, description:"The world's most prestigious flower show transforms the Royal Hospital Chelsea grounds into a breathtaking spectacle of garden design and rare plants.", bestTime:"Early morning on the first public day for uncrowded shots", photoTip:"Use a macro lens on dew-covered blooms in the show gardens; mid-morning light avoids harsh noon shadows.", url:"https://www.rhs.org.uk/shows-events/rhs-chelsea-flower-show" },
  { id:"cooper-hill-cheese-rolling", name:"Cooper's Hill Cheese Rolling", type:"custom", month:5, location:"Brockworth, Gloucestershire", region:"South West", lat:51.8465, lng:-2.1502, popularity:4, description:"Every Spring Bank Holiday Monday, competitors hurl themselves down an impossibly steep hillside chasing a wheel of Double Gloucester cheese — gloriously mad and photogenic.", bestTime:"Noon races on Spring Bank Holiday Monday", photoTip:"Position at the bottom of the hill with a fast telephoto (1/1000s+) to freeze competitors mid-tumble against the crowd above.", url:"https://www.cheese-rolling.co.uk" },
  { id:"oxford-may-morning", name:"Oxford May Morning", type:"custom", month:5, day:1, location:"Oxford", region:"South East", lat:51.7549, lng:-1.2547, popularity:3, description:"At 6am on 1 May, Magdalen College choir sings a Latin hymn from the college tower to welcome spring, as thousands celebrate on Magdalen Bridge.", bestTime:"Arrive by 5:30am for the crowd gathering; 6am for the choir", photoTip:"A 200mm zoom from Magdalen Bridge captures the choir silhouetted in the tower against the dawn sky." },
  { id:"hay-festival", name:"Hay Festival of Literature", type:"cultural", month:5, location:"Hay-on-Wye, Wales", region:"Wales", lat:52.0744, lng:-3.1278, popularity:4, description:"The 'Woodstock of the mind' brings writers and artists to this Welsh border town. Bunting-strewn streets, second-hand bookshops, and festive atmosphere reward candid documentary photography.", bestTime:"Daytime for street photography; golden hour against the Black Mountains", photoTip:"The narrow streets and overflowing bookshops are best captured with a 35mm prime for reportage-style images.", url:"https://www.hayfestival.com" },
  { id:"skomer-island-puffins", name:"Skomer Island Puffin Season", type:"nature", month:5, location:"Marloes, Pembrokeshire", region:"Wales", lat:51.735, lng:-5.294, popularity:4, description:"Skomer Island holds 36,000+ breeding puffin pairs. Day visitors can walk among the burrows as puffins ignore human observers entirely, offering extraordinary close-range wildlife photography.", bestTime:"Morning ferry arrival at 10am; puffins most active 10am–2pm", photoTip:"Sit still near an active burrow and let puffins return naturally — they land within inches and look straight at the camera.", url:"https://www.welshwildlife.org/nature-reserves/skomer" },
  { id:"beltane-glastonbury", name:"Beltane at Glastonbury Tor", type:"religious", month:5, day:1, location:"Glastonbury, Somerset", region:"South West", lat:51.1458, lng:-2.7168, popularity:2, description:"The ancient Celtic May Day fire festival is celebrated at Glastonbury Tor with bonfires, drumming, and dancing to welcome the summer.", bestTime:"Midnight bonfire lighting; dawn fire at the Tor summit", photoTip:"Shoot the tor silhouetted against the sunrise with bonfire smoke rising into a pink sky for a pagan-pastoral composition." },
  { id:"padstow-obby-oss", name:"Padstow Obby Oss", type:"custom", month:5, day:1, location:"Padstow, Cornwall", region:"South West", lat:50.5407, lng:-4.9376, popularity:4, description:"One of England's oldest May Day customs — two fearsome hobby horses (Obby Osses) dance through flower-decked Padstow streets accompanied by hundreds of blue-and-white clad followers singing the May Song.", bestTime:"From dawn as the Oss emerges; all-day dancing through the town", photoTip:"Get tight on the Oss's circular black 'skirt' and teaser with a 35mm — the mass of blue-and-white followers behind creates a joyful backdrop.", url:"https://www.padstow-live.co.uk/obby-oss" },
  { id:"helston-furry-dance", name:"Helston Furry Dance", type:"custom", month:5, day:8, location:"Helston, Cornwall", region:"South West", lat:50.1007, lng:-5.2718, popularity:3, description:"Helston's ancient Floral Dance sees top-hatted men and women in formal dress dance in procession through the town — and right through private houses — to celebrate the feast of St Michael on 8 May.", bestTime:"Noon principal dance when couples process through the main street", photoTip:"Shoot from a first-floor window looking down onto the procession — the formal dress and flowers weaving through the granite street is timeless." },
  { id:"castleton-garland-day", name:"Castleton Garland Day", type:"custom", month:5, day:29, location:"Castleton, Derbyshire", region:"East Midlands", lat:53.3438, lng:-1.7762, popularity:2, description:"On Oak Apple Day (29 May), a flower-covered 'garland' is hoisted by a king on horseback as he and his consort lead a procession through Castleton's Peak District village streets.", bestTime:"Afternoon procession from 6pm through the village", photoTip:"The garland king on horseback against the limestone crags of Mam Tor makes for a uniquely English Peak District composition." },
  { id:"bass-rock-gannets", name:"Bass Rock Gannet Colony", type:"nature", month:5, location:"North Berwick, East Lothian", region:"Scotland", lat:56.0768, lng:-2.6406, popularity:4, description:"The Bass Rock off the East Lothian coast holds the world's largest accessible gannet colony — 150,000 birds turn the volcanic plug white from April to October.", bestTime:"May to August when gannets are most active and diving", photoTip:"From a boat at the rock face, use 1/2000s to freeze gannets diving past the white-guano-streaked cliff face.", url:"https://www.seabird.org/visit-us/bass-rock" },
  { id:"farne-islands-seabirds", name:"Farne Islands Seabird Season", type:"nature", month:5, location:"Seahouses, Northumberland", region:"North East", lat:55.617, lng:-1.658, popularity:4, description:"The Farne Islands host vast colonies of puffins, Arctic terns, guillemots, and grey seals — accessible by boat from Seahouses. Puffins land within touching distance of visitors on Inner Farne.", bestTime:"May to July for breeding seabirds; terns most active June", photoTip:"Arctic terns will dive-bomb visitors to defend nests — hold a stick above your head and shoot the terns attacking it for dramatic action shots.", url:"https://www.nationaltrust.org.uk/visit/north-east/farne-islands" },
  // JUNE
  { id:"trooping-the-colour", name:"Trooping the Colour", type:"royal", month:6, location:"The Mall, London", region:"London", lat:51.5019, lng:-0.1287, popularity:5, description:"The Sovereign's official birthday parade sees 1,400 soldiers, 200 horses, and 400 musicians march in perfect formation. The precision and pageantry are unmatched in British ceremonial photography.", bestTime:"Morning parade from 10am on the second Saturday of June", photoTip:"Secure a spot on The Mall early for the cavalry column with Buckingham Palace behind, using a 200–300mm lens to compress the formation.", url:"https://www.royal.uk/trooping-colour" },
  { id:"changing-of-the-guard", name:"Changing of the Guard", type:"royal", month:6, location:"Buckingham Palace, London", region:"London", lat:51.5014, lng:-0.1419, popularity:4, description:"The daily ceremony sees the Old Guard relieved by the New Guard in full bearskin and red tunic, accompanied by a regimental band. Runs daily in summer.", bestTime:"11:15am daily; morning light optimal in summer", photoTip:"Position along Birdcage Walk for a clear line of sight as the guards march past with St James's Park as backdrop.", url:"https://www.royal.uk/changing-guard" },
  { id:"summer-solstice-stonehenge", name:"Summer Solstice at Stonehenge", type:"religious", month:6, day:21, location:"Stonehenge, Wiltshire", region:"South West", lat:51.1789, lng:-1.8262, popularity:5, description:"Tens of thousands gather at Stonehenge through the night to witness the midsummer sunrise align perfectly with the Heel Stone. One of Britain's most iconic photographic moments.", bestTime:"Sunrise at approximately 4:52am on 21 June", photoTip:"Arrive by 3am to secure a position inside the stones; shoot the Heel Stone silhouetted against the emerging sun using a graduated ND filter.", url:"https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/solstice-and-equinox/" },
  { id:"glastonbury-festival", name:"Glastonbury Festival", type:"festival", month:6, location:"Pilton, Somerset", region:"South West", lat:51.1543, lng:-2.5882, popularity:5, description:"The world's most famous music and arts festival transforms a Somerset farm into a temporary city of 200,000 people. From the Pyramid Stage to the Arcadia spider, the visual spectacle is relentless.", bestTime:"Golden hour on the Pyramid Stage; night for Arcadia fire shows", photoTip:"The Pyramid Stage faces east — shoot headliners at sunset for performers lit by golden hour from behind.", url:"https://www.glastonburyfestivals.co.uk" },
  { id:"puffin-season-handa", name:"Puffin Season — Handa Island", type:"nature", month:6, location:"Scourie, Sutherland", region:"Scotland", lat:58.3667, lng:-5.1, popularity:3, description:"Handa Island hosts some of Scotland's most accessible puffin colonies against dramatic red sandstone cliffs from late April through July.", bestTime:"Early morning from May to mid-July when birds are most active", photoTip:"Lie flat on the clifftop and wait quietly — puffins will land within metres for natural eye-level portraits without a hide." },
  { id:"cambridge-may-week", name:"Cambridge May Week", type:"cultural", month:6, location:"Cambridge", region:"East of England", lat:52.205, lng:0.1218, popularity:3, description:"Cambridge University's May Week sees students in black tie and ballgowns punting the Cam, celebrating the end of exams against King's College Chapel and weeping willows.", bestTime:"Early morning punting from 7am; late evening ball-goers at 11pm", photoTip:"Shoot punters on the Cam at dawn with King's College Chapel behind — long reflections in still water and early mist are magical." },
  { id:"appleby-horse-fair", name:"Appleby Horse Fair", type:"custom", month:6, location:"Appleby-in-Westmorland, Cumbria", region:"North West", lat:54.5793, lng:-2.4893, popularity:4, description:"Europe's largest Romany Gypsy and Traveller gathering transforms the small Eden Valley town each June, with thousands of decorated horse-drawn caravans, bareback riders washing horses in the river, and vibrant trading on the Fair Hill.", bestTime:"Morning horse washing in the River Eden; afternoon trading on Fair Hill", photoTip:"The River Eden horse-washing scene is the iconic image — use a long lens from the bridge to capture horses and riders mid-stream with the stone bridge behind.", url:"https://www.applebyfair.org" },
  { id:"beating-retreat", name:"Beating Retreat", type:"royal", month:6, location:"Horse Guards Parade, London", region:"London", lat:51.5029, lng:-0.1284, popularity:3, description:"The annual military musical spectacle on Horse Guards Parade features massed bands of the Household Division performing at dusk, with the floodlit Whitehall buildings as backdrop.", bestTime:"Dusk performance starting around 9pm in June", photoTip:"The golden-lit Horse Guards building behind the massed bands at dusk is the definitive shot — a 70–200mm from the stands works perfectly." },
  { id:"isle-of-wight-festival", name:"Isle of Wight Festival", type:"festival", month:6, location:"Newport, Isle of Wight", region:"South East", lat:50.6938, lng:-1.2874, popularity:3, description:"One of Britain's longest-running music festivals returns to Seaclose Park each June. The island setting, Solent views, and classic rock atmosphere make it one of the most photogenic of all UK festivals.", bestTime:"Golden hour on the main stage; dusk for the island skyline", photoTip:"Climb to the grassy banks at the rear of the arena for a wide-angle crowd shot with the Solent and mainland on the horizon.", url:"https://www.isleofwightfestival.com" },
  // JULY
  { id:"henley-royal-regatta", name:"Henley Royal Regatta", type:"sport", month:7, location:"Henley-on-Thames", region:"South East", lat:51.5353, lng:-0.8989, popularity:4, description:"Five days of elite rowing on the Thames, set against strawberries, Pimm's, and a blazing social scene of outlandish hats and striped blazers. As much fashion as sport.", bestTime:"Morning racing for calm water reflections; afternoon for fashion portraits", photoTip:"Use the panning technique at 1/125s along the course to blur the water and freeze the rowers in motion.", url:"https://www.hrr.co.uk" },
  { id:"swan-upping", name:"Swan Upping", type:"custom", month:7, location:"Henley-on-Thames", region:"South East", lat:51.5353, lng:-0.8989, popularity:3, description:"The ancient annual census of mute swans on the Thames, conducted by Royal Swan Uppers in scarlet uniforms aboard traditional skiffs over five days each July.", bestTime:"Mid-morning as skiffs work upstream in calm river light", photoTip:"Frame the scarlet-uniformed uppers against the white swans and green riverbanks for a pure English summer palette." },
  { id:"durham-miners-gala", name:"Durham Miners' Gala", type:"cultural", month:7, location:"Durham", region:"North East", lat:54.7761, lng:-1.5734, popularity:4, description:"Britain's largest gathering of the labour movement sees up to 200,000 people march through Durham with beautifully hand-embroidered colliery banners and brass bands.", bestTime:"Morning march from 9am through the city; speeches midday on the racecourse", photoTip:"Shoot the silk banners back-lit against the sky to make the embroidery glow; position opposite the cathedral for the definitive image.", url:"https://www.durhamminersassociation.org" },
  { id:"goodwood-festival-of-speed", name:"Goodwood Festival of Speed", type:"sport", month:7, location:"Goodwood, West Sussex", region:"South East", lat:50.8997, lng:-0.7572, popularity:4, description:"The world's greatest motorsport garden party sees F1 cars, supercars, and motorcycles climb the famous hillclimb past the Goodwood House backdrop, attended by 150,000 enthusiasts in summer style.", bestTime:"Hillclimb runs from 9am; quieter morning light best for static car displays", photoTip:"Use a 1/60s pan at the first bend of the hillclimb to blur the background while keeping the car sharp.", url:"https://www.goodwood.com/motorsport/festival-of-speed/" },
  { id:"royal-welsh-show", name:"Royal Welsh Show", type:"cultural", month:7, location:"Builth Wells, Powys", region:"Wales", lat:52.1548, lng:-3.3985, popularity:3, description:"Europe's largest agricultural show brings 200,000 visitors to mid-Wales for four days of livestock judging, Welsh black cattle, sheepdogs, and rural crafts.", bestTime:"Early morning livestock judging for the best animal portraits", photoTip:"Sheep judging in the main ring gives intimate animal portraiture — sheep are still and docile; use a 70–200mm for frame-filling fleece textures.", url:"https://www.rwas.wales/royal-welsh-show/" },
  { id:"hampton-court-flower-show", name:"RHS Hampton Court Palace Garden Festival", type:"cultural", month:7, location:"Hampton Court, Surrey", region:"London", lat:51.4037, lng:-0.3375, popularity:4, description:"The world's largest outdoor flower show fills the grounds of Hampton Court Palace each July with show gardens, floral displays, and horticultural innovation against a Tudor palace backdrop.", bestTime:"Early morning on opening day; golden hour for palace reflections in the Long Water", photoTip:"The Long Water canal with its lime avenue and the palace reflected at golden hour is a classic composition — use a polariser to deepen the reflection.", url:"https://www.rhs.org.uk/shows-events/rhs-hampton-court-palace-garden-festival" },
  // AUGUST
  { id:"notting-hill-carnival", name:"Notting Hill Carnival", type:"festival", month:8, day:25, endDay:26, location:"Notting Hill, London", region:"London", lat:51.5144, lng:-0.2023, popularity:5, description:"Europe's largest street festival brings two million people to west London's streets over the August Bank Holiday weekend with Caribbean masquerade costumes, steel bands, and sound systems.", bestTime:"Grand Parade on Bank Holiday Monday from 10am; early afternoon for full costume displays", photoTip:"Shoot dancers head-on as they approach; use 50–85mm and a fast shutter to freeze feathers mid-movement.", url:"https://www.thelondonnottinghillcarnival.com" },
  { id:"edinburgh-festival-fringe", name:"Edinburgh Festival Fringe", type:"festival", month:8, day:1, endDay:25, location:"Edinburgh", region:"Scotland", lat:55.9533, lng:-3.1883, popularity:5, description:"The world's largest arts festival turns Edinburgh's streets into a non-stop carnival of theatre, comedy, and street performance every August. The Royal Mile becomes one long outdoor stage.", bestTime:"Royal Mile midday street bustle; late-evening twilight portrait sessions", photoTip:"The narrow closes off the Royal Mile give beautiful compressed portrait backgrounds — pull performers aside for intimate shots.", url:"https://www.edfringe.com" },
  { id:"edinburgh-military-tattoo", name:"Royal Edinburgh Military Tattoo", type:"cultural", month:8, location:"Edinburgh Castle", region:"Scotland", lat:55.9485, lng:-3.1997, popularity:5, description:"The spectacular nightly performance on Edinburgh Castle's esplanade features massed pipe bands, international performers, and a thrilling firecracker finale against the castle backdrop.", bestTime:"Show starts 9pm; finale fireworks at approximately 10:30pm", photoTip:"From the upper tiers, a 24–70mm zoom captures both the full esplanade scene and tight details of the pipe band formation.", url:"https://www.edintattoo.co.uk" },
  { id:"cowes-week", name:"Cowes Week", type:"sport", month:8, location:"Cowes, Isle of Wight", region:"South East", lat:50.7601, lng:-1.2973, popularity:4, description:"The world's largest and oldest sailing regatta sees up to 1,000 yachts racing off the Isle of Wight over eight days every August. Spinnakers of every colour billow against the Solent.", bestTime:"Morning races for flat-light colour; late afternoon for golden light on sails", photoTip:"Charter a spectator RIB to shoot from water level — a zoom telephoto at 1/1000s freezes spray and sail drama.", url:"https://www.cowesweek.co.uk" },
  { id:"lonach-highland-gathering", name:"Lonach Highland Gathering", type:"sport", month:8, location:"Strathdon, Aberdeenshire", region:"Scotland", lat:57.2292, lng:-3.1667, popularity:3, description:"One of Scotland's most traditional Highland Games features a spectacular 10-mile march of clansmen in full Highland dress before athletic events begin.", bestTime:"Morning clansmen march from 9am through Strathdon villages", photoTip:"Stand at a bend in the road to capture the full column of kilted marchers with hills stretching behind." },
  { id:"national-eisteddfod-wales", name:"National Eisteddfod of Wales", type:"cultural", month:8, location:"Wales (roving location)", region:"Wales", lat:53.2276, lng:-4.3281, popularity:3, description:"Wales's premier cultural festival, conducted entirely in Welsh, brings bardic ceremonies, choral competitions, and traditional crafts to a different location each year. The Gorsedd ceremony in Druidic robes is visually extraordinary.", bestTime:"The Gorsedd Proclamation ceremony on the opening weekend", photoTip:"The Druidic robes — white, blue, and green — photograph brilliantly against the green eisteddfod field; shoot at eye level for dramatic portraits." },
  { id:"brecon-beacons-milky-way", name:"Brecon Beacons Dark Sky Reserve", type:"nature", month:8, location:"Brecon, Wales", region:"Wales", lat:51.88, lng:-3.44, popularity:3, description:"The Brecon Beacons is one of only five International Dark Sky Reserves in Wales and England, offering exceptional Milky Way photography on clear summer nights.", bestTime:"New moon nights in July–September for maximum star visibility", photoTip:"ISO 3200–6400, f/2.8, 20–25s; the Pen y Fan summit gives wide-horizon star-rise views with no light pollution." },
  { id:"peak-district-heather", name:"Peak District Heather Bloom", type:"nature", month:8, location:"Stanage Edge, Derbyshire", region:"East Midlands", lat:53.3531, lng:-1.6478, popularity:4, description:"The Peak District's gritstone moors turn vivid purple in August as the heather blooms, with iconic edges like Stanage, Curbar, and Froggatt providing dramatic foreground for landscape photography.", bestTime:"Golden hour in early August when heather is at peak bloom", photoTip:"Shoot low through the heather at Stanage Edge with the gritstone rocks as mid-ground and the Hope Valley stretching below in warm evening light." },
  { id:"brighton-pride", name:"Brighton Pride", type:"festival", month:8, location:"Brighton", region:"South East", lat:50.8225, lng:-0.1372, popularity:4, description:"One of Europe's largest Pride events fills Brighton's streets with an explosion of colour, creativity, and joy. The parade through the city centre and the festival in Preston Park attract 160,000+ visitors.", bestTime:"Morning parade from 11am; afternoon festival for detail shots", photoTip:"Brighton's Regency architecture and seafront provide a beautiful backdrop for the costumes — shoot against the white facades of Kemp Town for contrast.", url:"https://www.brighton-pride.org" },
  // SEPTEMBER
  { id:"bbc-proms-last-night", name:"BBC Proms — Last Night", type:"cultural", month:9, location:"Royal Albert Hall, London", region:"London", lat:51.5025, lng:-0.1791, popularity:4, description:"The Last Night of the Proms at the Royal Albert Hall and Hyde Park creates a sea of Union flags, outlandish fancy dress, and unabashed British patriotism.", bestTime:"Evening concert from 7:30pm; fireworks around 10:30pm", photoTip:"Shoot the Hyde Park crowd from an elevated position — the union flags, hats, and face paint rewards a 35mm reportage approach.", url:"https://www.bbc.co.uk/proms" },
  { id:"braemar-highland-gathering", name:"Braemar Royal Highland Gathering", type:"sport", month:9, location:"Braemar, Aberdeenshire", region:"Scotland", lat:57.0071, lng:-3.3976, popularity:5, description:"Scotland's most prestigious Highland Games, traditionally attended by the Royal Family, features caber tossing, hammer throwing, piping, and Highland dancing against the Cairngorms.", bestTime:"Mid-morning arrival; the caber toss at midday is the centrepiece event", photoTip:"Use a 70–200mm lens for the caber toss to isolate athletes against the blurred mountain backdrop.", url:"https://www.braemargathering.org" },
  { id:"great-north-run", name:"Great North Run", type:"sport", month:9, location:"Newcastle upon Tyne", region:"North East", lat:54.9783, lng:-1.6178, popularity:4, description:"The world's largest half marathon sees 60,000 runners cross the Tyne Bridge to South Shields every September in an explosion of colour, charity costumes, and raw human emotion.", bestTime:"Race morning from 10:30am; the Tyne Bridge moment is the peak image", photoTip:"Position on the bridge parapets above the runners for a compression telephoto shot of the packed field streaming across.", url:"https://www.greatrun.org/great-north-run" },
  { id:"totally-thames-festival", name:"Totally Thames Festival", type:"festival", month:9, location:"South Bank, London", region:"London", lat:51.508, lng:-0.0878, popularity:3, description:"The month-long Thames festival culminates in a spectacular night carnival with illuminated boats, fire performers, and large-scale light projections onto riverside buildings.", bestTime:"Night carnival from 8pm; blue hour at 7:30pm for bridge reflections", photoTip:"Shoot from a bridge looking east — the illuminated river, Shard, and Tower Bridge compose naturally as a single panoramic frame." },
  { id:"autumn-equinox-stonehenge", name:"Autumn Equinox at Stonehenge", type:"religious", month:9, day:22, location:"Stonehenge, Wiltshire", region:"South West", lat:51.1789, lng:-1.8262, popularity:3, description:"The autumn equinox brings another open-access gathering at Stonehenge as day and night equalise. The golden September light and smaller, more intimate crowd make for powerful atmospheric shots.", bestTime:"Sunrise around 7am on 22–23 September", photoTip:"The low September sun casts long shadows through the standing stones — position low to emphasise the stone shadows across the grass.", url:"https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/solstice-and-equinox/" },
  { id:"goodwood-revival", name:"Goodwood Revival", type:"sport", month:9, location:"Goodwood, West Sussex", region:"South East", lat:50.8997, lng:-0.7572, popularity:4, description:"The world's most popular historic motorsport event requires all 150,000 attendees to dress in period costume from 1948–1966. The result is a living 1950s time warp of fashion, cars, and atmosphere unique in Britain.", bestTime:"Morning paddock for fashion portraits; afternoon races for action", photoTip:"The paddock at golden hour with period-dressed crowds and vintage cars is sublime — a 50mm and available light captures the 1950s feel authentically.", url:"https://www.goodwood.com/motorsport/goodwood-revival/" },
  { id:"abbots-bromley-horn-dance", name:"Abbots Bromley Horn Dance", type:"custom", month:9, location:"Abbots Bromley, Staffordshire", region:"West Midlands", lat:52.8153, lng:-1.8668, popularity:3, description:"One of Britain's oldest folk customs — six dancers carrying ancient reindeer antlers (carbon-dated to 1065) dance a 10-mile circuit through the village on the Monday after 4 September.", bestTime:"Morning procession from St Nicholas Church at 8am; all day through the village", photoTip:"The churchyard start at dawn gives intimate access — shoot dancers with the Norman church behind as they collect the horns from the wall." },
  // OCTOBER
  { id:"whitby-goth-weekend-october", name:"Whitby Goth Weekend (Autumn)", type:"festival", month:10, location:"Whitby, North Yorkshire", region:"Yorkshire", lat:54.4857, lng:-0.6144, popularity:4, description:"October's Whitby Goth Weekend sees thousands of elaborately costumed goths swarming the abbey ruins and fishing town. The graveyard, abbey ruins, and harbour create Gothic portraiture of incomparable quality.", bestTime:"Late afternoon for abbey silhouettes; twilight at the graveyard", photoTip:"Ask costumed attendees to pose at the abbey entrance at blue hour — the stone arch frames them perfectly against a deep blue sky.", url:"https://www.whitbygothweekend.co.uk" },
  { id:"halloween-derry", name:"Derry Halloween Festival", type:"festival", month:10, day:31, location:"Derry / Londonderry", region:"Northern Ireland", lat:54.9966, lng:-7.3086, popularity:4, description:"Derry's walled city hosts what is widely considered the best Halloween festival in the world, with elaborate street theatre and a spectacular fireworks display over the River Foyle.", bestTime:"Evening from 7pm; fireworks at 9:30pm over the river", photoTip:"Shoot fireworks reflected in the River Foyle from the Peace Bridge — the double image doubles the impact of every burst.", url:"https://www.derryhalloween.com" },
  { id:"robin-hood-pageant", name:"Robin Hood Pageant", type:"cultural", month:10, location:"Nottingham Castle", region:"East Midlands", lat:52.9548, lng:-1.1581, popularity:3, description:"Nottingham Castle hosts a colourful medieval pageant with costumed archers, jousting, fire performers, and market stalls recreating the legendary outlaw's world.", bestTime:"Late afternoon for low autumn sun on the castle walls", photoTip:"Use the sandstone castle walls as a warm backdrop and shoot costumed characters with an 85mm lens for flattering portraits." },
  { id:"autumn-colours-lake-district", name:"Autumn Colours — Lake District", type:"nature", month:10, location:"Keswick, Cumbria", region:"North West", lat:54.6005, lng:-3.1344, popularity:4, description:"Borrowdale, Ullswater, and Derwentwater provide some of England's most celebrated autumn landscapes, perfectly mirrored in still lake water on windless mornings.", bestTime:"Windless dawn for perfect reflections; golden hour for warm fell light", photoTip:"Derwentwater's Friar's Crag viewpoint with its oak-framed lake view is one of England's finest composition spots — arrive 40 minutes before sunrise." },
  { id:"aurora-borealis-scotland", name:"Aurora Borealis — Orkney", type:"nature", month:10, location:"Orkney", region:"Scotland", lat:59.0, lng:-3.3, popularity:5, description:"Scotland's far north offers Britain's best chance of photographing the northern lights, especially above prehistoric standing stones like the Ring of Brodgar.", bestTime:"Clear, dark nights from September to March around the new moon", photoTip:"ISO 1600–3200, f/2.8, 15–25s; foreground interest such as Ring of Brodgar vastly improves aurora images." },
  { id:"isle-of-skye-quiraing", name:"Isle of Skye — Quiraing in Autumn", type:"nature", month:10, location:"Staffin, Skye", region:"Scotland", lat:57.65, lng:-6.28, popularity:5, description:"The Quiraing landslip offers some of Britain's most dramatic landscape photography: towering cliffs, pinnacles, and sweeping moorland turning golden in October.", bestTime:"Golden hour and storm-light breaks from September to November", photoTip:"Time your hike to the top for the first beam of storm-break sunlight — it lasts only seconds but transforms the scene completely." },
  { id:"red-deer-rut-richmond-park", name:"Red Deer Rut — Richmond Park", type:"nature", month:10, location:"Richmond Park, London", region:"London", lat:51.4431, lng:-0.2756, popularity:5, description:"Every October, red and fallow deer stags roar and clash antlers across Richmond Park in central London. 300 deer roam freely just 8 miles from Westminster — extraordinary wildlife photography without leaving the city.", bestTime:"Dawn and dusk throughout October when stags are most active", photoTip:"Use a 300–500mm telephoto at dawn for misty back-lit stags roaring through fog — the park's oak trees frame them beautifully." },
  { id:"loch-lomond-autumn", name:"Loch Lomond Autumn Colours", type:"nature", month:10, location:"Luss, Loch Lomond", region:"Scotland", lat:56.1, lng:-4.638, popularity:3, description:"The western shores of Loch Lomond around the village of Luss turn gold and amber in late October against Ben Lomond's reflection. Scotland at its most painterly.", bestTime:"Windless dawn in late October for perfect loch reflections", photoTip:"Wade into the loch's shallow margins for a wide-angle composition with reeds in the foreground and the mountain reflection beyond." },
  { id:"autumn-colours-new-forest", name:"New Forest Autumn — Pannage Season", type:"nature", month:10, location:"Lyndhurst, Hampshire", region:"South East", lat:50.8724, lng:-1.5803, popularity:3, description:"The New Forest turns gold, amber, and russet in October. During pannage season, free-roaming pigs fatten on acorns beneath ancient oaks alongside ponies — a uniquely English autumn scene.", bestTime:"Golden hour in mid-October; misty dawn for atmospheric forest light", photoTip:"Back-light the ponies against a low autumn sun to create a rim-lit silhouette in a blaze of orange leaf bokeh." },
  // NOVEMBER
  { id:"bonfire-night", name:"Bonfire Night", type:"festival", month:11, day:5, location:"Nationwide", region:"London", lat:51.5, lng:-0.1, popularity:5, description:"Guy Fawkes Night is celebrated across Britain with bonfires and firework displays on and around 5 November, from village greens to city parks.", bestTime:"Dusk to 9pm as fireworks are most vivid against a deep blue sky", photoTip:"Use a wide-angle lens on a tripod at f/8 and 3–6 second exposures to capture multiple firework trails in a single frame." },
  { id:"lewes-bonfire-night", name:"Lewes Bonfire Night", type:"festival", month:11, day:5, location:"Lewes, East Sussex", region:"South East", lat:50.8741, lng:0.0099, popularity:5, description:"The most dramatic Bonfire Night in Britain sees six rival bonfire societies parade through Lewes with burning torches, effigies, and Viking-style costumes before colossal bonfires.", bestTime:"Torch processions start around 6:30pm; bonfires from 8pm", photoTip:"Find a position overlooking one of the six bonfire arenas — wide angle at 8–15s captures the full firework arc and fire reflection.", url:"https://www.lewes-bonfire.co.uk" },
  { id:"remembrance-sunday", name:"Remembrance Sunday", type:"religious", month:11, location:"Cenotaph, London", region:"London", lat:51.5027, lng:-0.1283, popularity:4, description:"The national act of remembrance at the Cenotaph on Whitehall is one of Britain's most solemn ceremonies, with the Royal Family, veterans, and thousands of poppy-wearing spectators.", bestTime:"11am on the second Sunday of November for the two-minute silence", photoTip:"A 200–400mm telephoto from public viewing areas lets you focus on veterans' medals and emotional faces for intimate documentary images." },
  { id:"murmuration-starlings", name:"Starling Murmuration", type:"nature", month:11, location:"Shapwick Heath, Somerset", region:"South West", lat:51.1529, lng:-2.8197, popularity:4, description:"From October to February, hundreds of thousands of starlings perform their extraordinary aerial ballet above the Somerset Levels at dusk before roosting in the reeds.", bestTime:"30–45 minutes before sunset, from October to February", photoTip:"Use continuous burst mode at 1/1000s to freeze the murmuration shape; include the reed-bed horizon for scale and drama." },
  { id:"st-andrews-day", name:"St Andrew's Day", type:"cultural", month:11, day:30, location:"St Andrews, Fife", region:"Scotland", lat:56.3398, lng:-2.7967, popularity:3, description:"Scotland's national day brings parades, ceilidhs, and torch-lit events. St Andrews' ruined cathedral silhouetted against a winter sky is one of Scotland's finest heritage compositions.", bestTime:"Late afternoon for cathedral golden-hour silhouette; evening for torchlit events", photoTip:"Frame the cathedral ruins through the West Porch archway at sunset — the window acts as a natural vignette for the golden sky beyond." },
  { id:"donna-nook-grey-seals", name:"Donna Nook Grey Seal Pups", type:"nature", month:11, location:"Donna Nook, Lincolnshire", region:"East Midlands", lat:53.4748, lng:0.1515, popularity:4, description:"Each November, Donna Nook beach hosts one of England's most accessible grey seal breeding colonies, with hundreds of fluffy white pups born in the dunes.", bestTime:"November through December for peak pup numbers", photoTip:"Lie flat on the beach to photograph pups at eye level — they will approach within centimetres of curious visitors.", url:"https://www.lincstrust.org.uk/reserves/donna-nook" },
  { id:"tar-barrel-rolling", name:"Tar Barrel Rolling — Ottery St Mary", type:"custom", month:11, day:5, location:"Ottery St Mary, Devon", region:"South West", lat:50.7472, lng:-3.2826, popularity:3, description:"On Bonfire Night, flaming tar barrels are hoisted onto the shoulders of brave runners who career through packed crowds in this extraordinary 400-year-old custom. Utterly unique to Ottery St Mary.", bestTime:"Races run from 4pm through to midnight — women's and children's barrels first", photoTip:"Position along the main street and shoot the barrel carrier head-on with a fast prime at ISO 6400 — the flames illuminate everything around them." },
  { id:"lumiere-durham", name:"Lumiere Durham", type:"festival", month:11, location:"Durham", region:"North East", lat:54.7761, lng:-1.5734, popularity:4, description:"The UK's largest light festival transforms Durham's medieval streets and cathedral every two years (odd years) in November, with large-scale light projections turning the Norman cathedral into a canvas of colour.", bestTime:"From dusk (5pm) — the cathedral projections are most spectacular at full darkness around 6–8pm", photoTip:"Shoot the cathedral from Prebends Bridge with the illuminated reflection in the River Wear — a 30-second exposure smooths the water into a perfect mirror.", url:"https://www.lumiere-festival.com" },
  // DECEMBER
  { id:"burning-of-the-clocks", name:"Burning of the Clocks", type:"festival", month:12, day:21, location:"Brighton", region:"South East", lat:50.8225, lng:-0.1372, popularity:3, description:"Brighton's winter solstice celebration sees a lantern procession of handmade paper and willow clocks wind through the city before being fed to a bonfire on the beach at midnight.", bestTime:"Lantern procession from 7pm; beach bonfire at midnight", photoTip:"Use a long exposure (8–15s) at the beach to capture the bonfire reflection and blurred lantern carriers as flowing light trails.", url:"https://www.samesky.co.uk/events/burning-clocks/" },
  { id:"edinburgh-christmas-market", name:"Edinburgh Christmas Market", type:"market", month:12, location:"Edinburgh", region:"Scotland", lat:55.9533, lng:-3.1883, popularity:4, description:"Edinburgh's European-style Christmas market on East Princes Street Gardens, with the castle and Scott Monument as backdrop, creates one of Britain's most photogenic winter scenes.", bestTime:"Blue hour (4–5pm in December) for the perfect balance of ambient and market light", photoTip:"Shoot from a high viewpoint on the Mound for a wide-angle scene with the castle looming behind the illuminated market below.", url:"https://www.edinburghschristmas.com" },
  { id:"bath-christmas-market", name:"Bath Christmas Market", type:"market", month:12, location:"Bath, Somerset", region:"South West", lat:51.3814, lng:-2.3592, popularity:4, description:"One of the UK's most beautiful Christmas markets wraps around the Abbey and Roman Baths in honey-coloured Georgian Bath, with over 180 wooden chalets selling artisan crafts.", bestTime:"Blue hour (4–5pm) when the Abbey is golden-lit against a deep blue sky", photoTip:"Use the Abbey's West Front as a backdrop for portraits of stall holders — the warm stone reflects festive light beautifully.", url:"https://www.bathchristmasmarket.co.uk" },
  { id:"york-christmas-market", name:"York St Nicholas Fair", type:"market", month:12, location:"York", region:"Yorkshire", lat:53.9601, lng:-1.0845, popularity:4, description:"York's Christmas market fills Parliament Street in the shadow of the ancient Minster, with traditional crafts, mulled wine, and festive lights in a deeply atmospheric medieval setting.", bestTime:"Early evening for the best light balance between ambient and festive illuminations", photoTip:"Explore the medieval Shambles street by night — the overhanging timber-framed shops hung with fairy lights are uniquely cinematic.", url:"https://www.visityork.org/christmas" },
  { id:"birmingham-christmas-market", name:"Birmingham Frankfurt Christmas Market", type:"market", month:12, location:"Birmingham", region:"West Midlands", lat:52.4796, lng:-1.9026, popularity:4, description:"Europe's largest outdoor Christmas market outside Germany stretches along Victoria Square and New Street, with over 180 German-style stalls and a giant Ferris wheel.", bestTime:"After dark (5–8pm) for maximum festive illumination impact", photoTip:"Shoot the Ferris wheel reflection in puddles after rain — Birmingham's urban setting makes the contrast of lights and architecture striking.", url:"https://www.visitbirmingham.com/christmas" },
  { id:"london-christmas-lights", name:"London Christmas Lights", type:"cultural", month:12, location:"West End, London", region:"London", lat:51.5149, lng:-0.1416, popularity:5, description:"London's West End transforms with elaborate light installations on Oxford Street, Carnaby Street, Regent Street, and Covent Garden from mid-November through January.", bestTime:"Blue hour (4–5pm) for the best sky colour behind the illuminations", photoTip:"Use Carnaby Street's narrow width to create a light-tunnel compression effect with a wide-angle lens at a low aperture." },
  { id:"winter-solstice-stonehenge", name:"Winter Solstice at Stonehenge", type:"religious", month:12, day:21, location:"Stonehenge, Wiltshire", region:"South West", lat:51.1789, lng:-1.8262, popularity:4, description:"English Heritage opens Stonehenge for dawn access on the winter solstice, when the sunrise aligns through the stones. The intimate gathering of druids and photographers inside the monument is powerful.", bestTime:"Winter solstice sunrise at approximately 8:09am on 21 December", photoTip:"Shoot the sunrise silhouette through the trilithon archway with participants' silhouettes; a 24mm lens captures the full stone frame.", url:"https://www.english-heritage.org.uk/visit/places/stonehenge/things-to-do/solstice-and-equinox/" },
  { id:"giants-causeway-winter", name:"Giant's Causeway at Sunrise", type:"nature", month:12, location:"Bushmills, Northern Ireland", region:"Northern Ireland", lat:55.2408, lng:-6.5116, popularity:5, description:"Northern Ireland's UNESCO World Heritage Site is best photographed in winter when pre-dawn access allows photography before the crowds. Long-wave sunrises light the hexagonal basalt columns in warm amber.", bestTime:"30 minutes before sunrise in winter (around 8:30am in December)", photoTip:"Use a 10-stop ND filter for a 2–4 minute exposure to smooth the Atlantic waves into silky mist washing over the columns.", url:"https://www.nationaltrust.org.uk/visit/northern-ireland/giants-causeway" },
  { id:"london-new-years-eve", name:"London New Year's Eve Fireworks", type:"festival", month:12, day:31, location:"South Bank, London", region:"London", lat:51.5033, lng:-0.1195, popularity:5, description:"London's ticketed New Year's Eve fireworks display launches from the London Eye with the Thames and the Houses of Parliament as backdrop — one of the world's most watched celebrations.", bestTime:"Midnight — secure a ticketed viewing spot or find a vantage point on Waterloo Bridge by 9pm", photoTip:"Waterloo Bridge gives the iconic view: Big Ben left, London Eye centre, South Bank right — use 15s exposure to layer multiple firework bursts.", url:"https://www.london.gov.uk/events/new-years-eve" },
];

// ─── Postcodes ────────────────────────────────────────────────────────────────

const POSTCODES: Record<string, string | null> = {
  "hogmanay-edinburgh":          "EH1 1RF",
  "up-helly-aa":                 "ZE1 0LB",
  "burns-night":                 "KA7 4PQ",
  "red-kite-feeding-wales":      "LD6 5BL",
  "norfolk-broads-winter-sunrise":"NR12 8AA",
  "snowdonia-winter-landscape":  "LL55 4TY",
  "celtic-connections-glasgow":  "G2 3NY",
  "mari-lwyd":                   "CF34 0SB",
  "chinese-new-year-london":     "W1D 5PS",
  "snowdrop-season":             "RG20 8NJ",
  "york-viking-festival":        "YO1 9WT",
  "imbolc-glastonbury":          "BA6 8BN",
  "st-davids-day":               "CF10 3RB",
  "st-patricks-day-belfast":     "BT1 2DX",
  "oxford-cambridge-boat-race":  "SW6 3JT",
  "holi-festival-london":        "W2 2UH",
  "spring-equinox-stonehenge":   "SP4 7DE",
  "spring-lambs-yorkshire-dales":"DL8 3RD",
  "beltane-fire-festival-edinburgh":"EH7 5AA",
  "bluebells-spring":            "SO21 3BH",
  "aintree-grand-national":      "L9 5AS",
  "london-marathon":             "SE1 2UP",
  "whitby-goth-weekend-april":   "YO21 1LD",
  "chelsea-flower-show":         "SW3 4LW",
  "cooper-hill-cheese-rolling":  "GL3 4QB",
  "oxford-may-morning":          "OX1 4AU",
  "hay-festival":                "HR3 5BX",
  "skomer-island-puffins":       "SA62 3BJ",
  "beltane-glastonbury":         "BA6 8BN",
  "padstow-obby-oss":            "PL28 8EA",
  "helston-furry-dance":         "TR13 8ST",
  "castleton-garland-day":       "S33 8WN",
  "bass-rock-gannets":           "EH39 4SS",
  "farne-islands-seabirds":      "NE68 7RN",
  "trooping-the-colour":         "SW1A 2AX",
  "changing-of-the-guard":       "SW1A 1AA",
  "summer-solstice-stonehenge":  "SP4 7DE",
  "glastonbury-festival":        "BA4 4BY",
  "puffin-season-handa":         "IV27 4TH",
  "cambridge-may-week":          "CB2 1ST",
  "appleby-horse-fair":          "CA16 6XA",
  "beating-retreat":             "SW1A 2AX",
  "isle-of-wight-festival":      "PO30 2ND",
  "henley-royal-regatta":        "RG9 2LY",
  "swan-upping":                 "RG9 2LY",
  "durham-miners-gala":          "DH1 5GL",
  "goodwood-festival-of-speed":  "PO18 0PX",
  "royal-welsh-show":            "LD2 3SY",
  "hampton-court-flower-show":   "KT8 9AU",
  "notting-hill-carnival":       "W10 6RA",
  "edinburgh-festival-fringe":   "EH1 1QS",
  "edinburgh-military-tattoo":   "EH1 2NG",
  "cowes-week":                  "PO31 7AJ",
  "lonach-highland-gathering":   "AB36 8UP",
  "national-eisteddfod-wales":   null,
  "brecon-beacons-milky-way":    "LD3 9LP",
  "peak-district-heather":       "S32 1BR",
  "brighton-pride":              "BN1 1NH",
  "bbc-proms-last-night":        "SW7 2AP",
  "braemar-highland-gathering":  "AB35 5YX",
  "great-north-run":             "NE1 7JB",
  "totally-thames-festival":     "SE1 8XT",
  "autumn-equinox-stonehenge":   "SP4 7DE",
  "goodwood-revival":            "PO18 0PX",
  "abbots-bromley-horn-dance":   "WS15 3BP",
  "whitby-goth-weekend-october": "YO21 1LD",
  "halloween-derry":             "BT48 6HH",
  "robin-hood-pageant":          "NG1 6EL",
  "autumn-colours-lake-district":"CA12 5DF",
  "aurora-borealis-scotland":    "KW15 1BU",
  "isle-of-skye-quiraing":       "IV51 9JU",
  "red-deer-rut-richmond-park":  "TW10 5HS",
  "loch-lomond-autumn":          "G83 8NZ",
  "autumn-colours-new-forest":   "SO43 7NY",
  "bonfire-night":               null,
  "lewes-bonfire-night":         "BN7 2LB",
  "remembrance-sunday":          "SW1A 2AX",
  "murmuration-starlings":       "BS28 4PH",
  "st-andrews-day":              "KY16 9UY",
  "donna-nook-grey-seals":       "LN11 7QN",
  "tar-barrel-rolling":          "EX11 1BD",
  "lumiere-durham":              "DH1 3EQ",
  "burning-of-the-clocks":       "BN2 1TG",
  "edinburgh-christmas-market":  "EH2 2EJ",
  "bath-christmas-market":       "BA1 1LT",
  "york-christmas-market":       "YO1 8ZZ",
  "birmingham-christmas-market": "B2 5JS",
  "london-christmas-lights":     "W1C 1JT",
  "winter-solstice-stonehenge":  "SP4 7DE",
  "giants-causeway-winter":      "BT57 8SU",
  "london-new-years-eve":        "SE1 8XT",
};

// ─── Seed logic ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${legacyEvents.length} events…`);

  for (const e of legacyEvents) {
    const startDate = toDate(YEAR, e.month, e.day ?? 1);
    const endDate   = e.endDay
      ? toDate(YEAR, e.endMonth ?? e.month, e.endDay)
      : undefined;

    const eventType = legacyTypeMap[e.type] ?? "FESTIVAL";

    await prisma.event.upsert({
      where: { slug: e.id },
      update: {},
      create: {
        slug:           e.id,
        title:          e.name,
        description:    e.description,
        type:           eventType,
        status:         "SCHEDULED",
        startDate,
        endDate,
        allDay:         true,
        recurringAnnual:true,
        region:         e.region,
        city:           e.location,
        lat:            e.lat,
        lng:            e.lng,
        free:           true,
        indoorOutdoor:  "OUTDOOR",
        postcode:       POSTCODES[e.id] ?? null,
        photoMeta: {
          create: {
            photoPotentialScore:  e.popularity,
            bestArrivalTime:      e.bestTime,
            lensSuggestion:       e.photoTip,
            fireSmokeLight:       ["festival","custom","religious","protest"].includes(e.type),
            bannersFlagsCandles:  ["festival","protest","royal","cultural"].includes(e.type),
            processionElements:   ["custom","royal","protest","parade"].includes(e.type),
            routeMoving:          ["custom","sport","protest","parade"].includes(e.type),
          },
        },
        sources: e.url ? {
          create: {
            sourceUrl:      e.url,
            sourceType:     "WEB" as SourceType,
            confidenceScore:80,
            lastCheckedAt:  new Date(),
          },
        } : undefined,
      },
    });

    // Set postcode only if not already set
    const pc = POSTCODES[e.id];
    if (pc) {
      await prisma.event.updateMany({
        where: { slug: e.id, postcode: null },
        data: { postcode: pc },
      });
    }

    process.stdout.write(".");
  }

  console.log(`\nDone — ${legacyEvents.length} events seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
