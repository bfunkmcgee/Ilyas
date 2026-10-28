// ===== SAMPLED SOUND (since V69) =====
// The prologue's sounds as recordings, The Long Night Sound List made in code: tools/sfx renders them (python3 tools/sfx/render.py <out>
// --web --install .), one file a sound in sfx/ with its takes one after another, and SFX_MAN below says where each take sits (or a
// loop's window). The page loads them beside itself by a relative path, a stage's worth at a time, so the published page needs the
// files published with it (see GUIDE.md, "Publishing"); a page opened as a file, or one a file will not load for, plays the synthesized
// sounds as before.
// The game calls S.hooks.sound(key, v, c) as it always has; this hook is the last one wrapped, so it hears every call first. It picks
// the recording for the moment (by the key, the value, what the call's c says about it, and where the story is) and plays one of its
// takes; a call it has no recording for, or one whose file is not loaded yet, goes on down to the synthesized sound. c may name the
// recording outright ({s:'desk_slam'}), say that another recording carries the moment ({skip:'desk_slam'}: silent only while that one
// is loaded), and carry take, delay, from, dur, rate, g (gain). Sounds never change the game: nothing here writes what the game reads.
// The held sounds follow the scene each frame (the stage's background, the bike, the rails, the carrier, the fire, the helicopter, the
// lift, the fall's wind), and footsteps come from the game's own steps. Everything goes out through one gain the sound switch closes.
const SFX_MAN=/*SFX_MAN*/{"swing_light":{"t":[[0.0,0.18235,-15.1],[0.28235,0.23052,-14.4],[0.61287,0.17515,-15.6],[0.88802,0.21923,-14.9]]},"swing_mid":{"t":[[0.0,0.3829,-17.2],[0.4829,0.25442,-18.7],[0.83731,0.43569,-15.3],[1.373,0.27454,-13.8]]},"swing_heavy":{"t":[[0.0,0.53819,-21.7],[0.63819,0.6775,-17.2],[1.41569,0.48756,-20.0]]},"hit_cut":{"t":[[0.0,0.32,-20.1],[0.42,0.32,-17.9],[0.84,0.32,-19.2],[1.26,0.32,-18.5]]},"hit_blunt":{"t":[[0.0,0.31831,-15.4],[0.41831,0.31946,-15.2],[0.83777,0.31946,-18.4],[1.25723,0.32,-15.7]]},"hit_bullet":{"t":[[0.0,0.31069,-20.4],[0.41069,0.31056,-21.5],[0.82125,0.31083,-21.5]]},"crit_cut":{"t":[[0.0,0.53865,-20.8],[0.63865,0.53898,-21.0],[1.27763,0.53867,-21.0]]},"crit_blunt":{"t":[[0.0,0.54469,-18.2],[0.64469,0.54408,-18.4],[1.28877,0.5444,-17.4]]},"finish_through":{"t":[[0.0,0.6776,-22.2],[0.7776,0.64083,-22.3]]},"finish_neck":{"t":[[0.0,0.39117,-20.5],[0.49117,0.38692,-21.0]]},"clang":{"t":[[0.0,0.68,-21.4],[0.78,0.67998,-22.1],[1.55998,0.68,-20.5],[2.33998,0.68,-20.5]]},"clang_light":{"t":[[0.0,0.38969,-21.8],[0.48969,0.4,-18.3],[0.98969,0.4,-19.7]]},"shing":{"t":[[0.0,0.61552,-16.2],[0.71552,0.61525,-15.4],[1.43077,0.61596,-16.5]]},"crack":{"t":[[0.0,0.44592,-25.3],[0.54592,0.45737,-25.3],[1.10329,0.46802,-22.1]]},"bottle_smash":{"t":[[0.0,0.4929,-15.1],[0.5929,0.54935,-20.3],[1.24225,0.54208,-18.1]]},"drop_blade":{"t":[[0.0,0.72654,-23.3],[0.82654,0.75,-22.3],[1.67654,0.74323,-23.6]]},"drop_gun":{"t":[[0.0,0.29744,-25.6],[0.39744,0.25204,-24.2],[0.74948,0.52846,-18.6]]},"thud_light":{"t":[[0.0,0.3099,-20.4],[0.4099,0.31102,-20.1],[0.82092,0.31133,-18.6],[1.23225,0.31679,-17.9]]},"thud":{"t":[[0.0,0.48,-15.2],[0.58,0.48,-15.8],[1.16,0.48,-15.1],[1.74,0.48,-16.2]]},"thud_heavy":{"t":[[0.0,0.59888,-17.9],[0.69888,0.6,-17.3],[1.39888,0.6,-16.7]]},"thud_dirt":{"t":[[0.0,0.49862,-18.3],[0.59862,0.49725,-21.5],[1.19588,0.5,-21.2]]},"thud_metal":{"t":[[0.0,0.65,-22.5],[0.75,0.65,-23.9],[1.5,0.65,-21.5]]},"arc_unroll":{"t":[[0.0,0.30575,-17.1],[0.40575,0.30169,-19.4]]},"arc_lock":{"t":[[0.0,0.99881,-25.3],[1.09881,0.998,-24.1]]},"arc_reroll":{"t":[[0.0,0.38335,-18.2],[0.48335,0.37942,-19.2]]},"arc_lash":{"t":[[0.0,0.42796,-22.5],[0.52796,0.4431,-24.1],[1.07106,0.40744,-24.5]]},"bolt":{"t":[[0.0,0.5,-13.5],[0.6,0.5,-12.7],[1.2,0.5,-13.1]]},"bolt_hit":{"t":[[0.0,0.44962,-19.8],[0.54963,0.4486,-21.7],[1.09823,0.44608,-21.9]]},"gale":{"t":[[0.0,1.1,-18.1],[1.2,1.1,-16.3]]},"blink":{"t":[[0.0,0.62,-15.5],[0.72,0.62,-14.5],[1.44,0.62,-13.7]]},"vault":{"t":[[0.0,0.34117,-16.9],[0.44117,0.29331,-17.7],[0.83448,0.30658,-18.5]]},"wow":{"t":[[0.0,1.56377,-18.7],[1.66377,1.55902,-16.7]]},"shot_pistol":{"t":[[0.0,0.87554,-22.1],[0.97554,0.87742,-21.5],[1.95296,0.88035,-21.6],[2.93331,0.87752,-21.5]]},"shot_rifle":{"t":[[0.0,1.28758,-20.5],[1.38758,1.28771,-19.9],[2.77529,1.28835,-20.2]]},"shot_smg":{"t":[[0.0,0.42,-18.8],[0.52,0.42,-18.8],[1.04,0.42,-18.7],[1.56,0.42,-18.9]]},"shot_mg":{"t":[[0.0,0.55,-18.0],[0.65,0.55,-18.9],[1.3,0.55,-16.7]]},"gun_dryfire":{"t":[[0.0,0.11567,-21.9],[0.21567,0.07242,-22.4],[0.38808,0.10296,-22.6]]},"ricochet":{"t":[[0.0,0.65,-21.2],[0.75,0.64894,-20.6],[1.49894,0.65,-18.8],[2.24894,0.65,-18.0]]},"bullet_ground":{"t":[[0.0,0.35,-24.6],[0.45,0.35,-23.0],[0.9,0.35,-22.3]]},"bullet_metal":{"t":[[0.0,0.29263,-18.5],[0.39263,0.28575,-19.7],[0.77838,0.29921,-19.1],[1.17758,0.295,-19.7]]},"casing":{"t":[[0.0,0.41163,-19.0],[0.51162,0.40929,-19.0],[1.02092,0.389,-19.2],[1.50992,0.38958,-18.0]]},"bullet_whiz":{"t":[[0.0,0.28531,-15.9],[0.38531,0.28775,-16.3],[0.77306,0.28602,-16.7]]},"glass_small":{"t":[[0.0,0.58933,-18.7],[0.68933,0.57212,-19.9],[1.36146,0.55788,-18.1],[2.01933,0.56537,-18.3]]},"glass_large":{"t":[[0.0,1.4035,-22.8],[1.5035,1.31231,-21.1],[2.91581,1.47373,-22.4]]},"glass_crunch":{"t":[[0.0,0.25362,-18.5],[0.35363,0.27054,-18.3],[0.72417,0.26702,-17.6]]},"china":{"t":[[0.0,0.45008,-18.6],[0.55008,0.41848,-16.7],[1.06856,0.39448,-18.4],[1.56304,0.60394,-23.2]]},"paper":{"t":[[0.0,0.53187,-19.2],[0.63187,0.6,-23.0],[1.33187,0.57519,-21.7]]},"plaster":{"t":[[0.0,0.74833,-21.1],[0.84833,0.75,-20.3],[1.69833,0.74921,-20.9]]},"door_swing":{"t":[[0.0,0.94623,-22.0],[1.04623,0.9496,-22.5]]},"table_topple":{"t":[[0.0,1.12888,-17.3],[1.22887,1.11856,-20.4]]},"table_break":{"t":[[0.0,1.04598,-23.6],[1.14598,1.04602,-20.7]]},"prop_tumble":{"t":[[0.0,0.47369,-19.5],[0.57369,0.57023,-19.7],[1.24392,0.75,-21.8]]},"prop_break":{"t":[[0.0,0.93621,-27.3],[1.03621,0.98704,-25.5],[2.12325,0.94606,-25.9]]},"lamp_knock":{"t":[[0.0,0.74123,-24.1],[0.84123,0.74452,-19.2],[1.68575,0.7301,-21.6]]},"lamp_fall":{"t":[[0.0,1.14344,-23.6],[1.24344,1.13346,-23.0]]},"range_slam":{"t":[[0.0,0.8854,-21.3],[0.9854,0.80571,-20.8]]},"sizzle":{"t":[[0.0,0.95,-25.0],[1.05,0.95,-22.9]]},"amb_sundown_loop":{"l":[0.25,20.25]},"bike_start":{"t":[[0.0,2.1,-22.1]]},"bike_loop_low":{"l":[0.25,6.25]},"bike_loop_high":{"l":[0.25,6.25]},"bike_rev_dirt":{"t":[[0.0,1.6,-13.9],[1.7,1.6,-15.2]]},"amb_field_loop":{"l":[0.25,20.25]},"maize_push":{"t":[[0.0,1.48865,-17.4],[1.58865,1.5,-17.1],[3.18865,1.48902,-17.5]]},"amb_avenue_loop":{"l":[0.25,20.25]},"bike_rival_loop":{"l":[0.25,6.25]},"bike_rev":{"t":[[0.0,1.5,-17.5],[1.6,1.5,-18.7]]},"bike_crash":{"t":[[0.0,2.19192,-24.7],[2.29192,2.19323,-25.6],[4.58515,2.18652,-26.9]]},"road_tumble":{"t":[[0.0,1.59587,-20.4],[1.69588,1.5989,-21.1]]},"amb_checkpoint_loop":{"l":[0.25,20.25]},"apc_idle_loop":{"l":[0.25,6.25]},"rifle_draw":{"t":[[0.0,0.59756,-21.0]]},"bike_into_apc":{"t":[[0.0,1.67717,-26.6]]},"boom_fuel":{"t":[[0.0,3.5774,-15.8]]},"fire_loop":{"l":[0.25,20.25]},"concrete_slam":{"t":[[0.0,0.55,-19.3],[0.65,0.55,-17.4],[1.3,0.55,-18.1]]},"grenade_unclip":{"t":[[0.0,0.32,-23.8]]},"amb_street_loop":{"l":[0.25,20.25]},"grenade_pin":{"t":[[0.0,0.44967,-14.0]]},"grenade_bounce":{"t":[[0.0,0.6,-25.3],[0.7,0.6,-23.6]]},"boom_grenade":{"t":[[0.0,2.84383,-24.4]]},"amb_dining_loop":{"l":[0.25,20.25]},"amb_kitchen_loop":{"l":[0.25,20.25]},"wall_latch":{"t":[[0.0,0.43742,-21.6]]},"wall_slide":{"t":[[0.0,1.33408,-15.0]]},"lift_bell":{"t":[[0.0,1.7,-10.6],[1.8,1.7,-12.1]]},"lift_doors":{"t":[[0.0,1.08475,-16.5],[1.18475,1.05867,-14.9]]},"amb_station_loop":{"l":[0.25,20.25]},"train_idle_loop":{"l":[0.25,6.25]},"train_depart":{"t":[[0.0,4.3,-13.4]]},"rail_loop":{"l":[0.25,12.25]},"rail_clack":{"t":[[0.0,0.4,-26.5],[0.5,0.4,-24.0],[1.0,0.4,-25.6],[1.5,0.4,-25.9]]},"goblin_chitter":{"t":[[0.0,3.13229,-15.2]]},"goblin_drop":{"t":[[0.0,0.54306,-25.1],[0.64306,0.53265,-20.1],[1.27571,0.54675,-23.8]]},"goblin_squeal":{"t":[[0.0,0.41569,-14.4],[0.51569,0.38698,-13.8],[1.00267,0.43977,-14.7],[1.54244,0.40929,-16.2]]},"goblin_snarl":{"t":[[0.0,0.36815,-18.0],[0.46815,0.36781,-18.4],[0.93596,0.36725,-17.4],[1.40321,0.36704,-18.7]]},"goblin_death":{"t":[[0.0,0.44946,-13.0],[0.54946,0.45023,-15.6],[1.09969,0.41144,-14.7]]},"splat":{"t":[[0.0,0.43075,-17.9],[0.53075,0.43046,-17.9],[1.06121,0.43075,-17.4]]},"brake":{"t":[[0.0,2.7,-11.8],[2.8,2.7,-12.4]]},"ixet_roar":{"t":[[0.0,2.38852,-15.8],[2.48852,2.3894,-16.7]]},"ixet_hiss":{"t":[[0.0,1.1,-15.3],[1.2,1.1,-16.0],[2.4,1.1,-15.8]]},"tail_swing":{"t":[[0.0,0.50858,-21.3],[0.60858,0.51692,-22.9]]},"tail_writhe":{"t":[[0.0,2.0,-17.7]]},"cage_gate":{"t":[[0.0,1.14898,-18.5],[1.24898,1.12692,-19.9]]},"freight_start":{"t":[[0.0,1.25,-18.5]]},"freight_loop":{"l":[0.25,6.25]},"amb_lobby_loop":{"l":[0.25,20.25]},"coat_sweep":{"t":[[0.0,0.53581,-15.9]]},"coat_throw":{"t":[[0.0,0.80854,-16.7]]},"charge_plant":{"t":[[0.0,0.27198,-26.4]]},"charge_beep":{"t":[[0.0,0.1,-1.7]]},"boom_breach":{"t":[[0.0,3.06881,-22.3]]},"debris_rattle":{"t":[[0.0,1.69296,-22.7]]},"wood_clack":{"t":[[0.0,0.19994,-19.1],[0.29994,0.20477,-18.4],[0.60471,0.20685,-21.5],[0.91156,0.20579,-22.1]]},"amb_office_loop":{"l":[0.25,20.25]},"chair_topple":{"t":[[0.0,1.17748,-23.6]]},"desk_slam":{"t":[[0.0,0.63467,-22.5]]},"over_desk":{"t":[[0.0,1.29615,-16.7]]},"window_crash":{"t":[[0.0,2.2,-20.9]]},"wind_in":{"t":[[0.0,3.19979,-14.6]]},"amb_roof_loop":{"l":[0.25,20.25]},"heli_approach":{"t":[[0.0,5.9196,-16.5]]},"heli_loop":{"l":[0.25,8.25]},"heli_door":{"t":[[0.0,1.24015,-17.3]]},"hex_charge":{"t":[[0.0,1.13875,-15.4]]},"hex_shot":{"t":[[0.0,2.71565,-19.2]]},"hex_wound":{"t":[[0.0,0.63573,-17.7]]},"aether_drain":{"t":[[0.0,2.37054,-14.7]]},"over_edge":{"t":[[0.0,1.6,-17.7]]},"fall_wind_loop":{"l":[0.25,20.25]},"pit_steel":{"t":[[0.0,1.0939,-22.7],[1.1939,1.09358,-22.1]]},"pit_wood":{"t":[[0.0,0.81154,-23.8],[0.91154,0.81131,-23.3]]},"pit_wood_break":{"t":[[0.0,1.01723,-25.2]]},"pit_car":{"t":[[0.0,1.03121,-21.0],[1.13121,1.01644,-22.3]]},"pit_pipe":{"t":[[0.0,1.04679,-22.5],[1.14679,1.0449,-22.8]]},"pit_neon":{"t":[[0.0,1.42717,-22.3],[1.52717,1.40308,-20.7]]},"pit_rock":{"t":[[0.0,0.8126,-23.5],[0.9126,0.8126,-23.0],[1.82521,0.8126,-23.4]]},"gravel":{"t":[[0.0,1.01773,-20.0],[1.11773,1.02183,-20.2]]},"spike_impale":{"t":[[0.0,0.92571,-21.2]]},"arm_tear":{"t":[[0.0,0.18733,-17.2],[0.28733,0.23658,-15.7],[0.62392,0.33952,-22.4],[1.06344,0.33744,-17.7],[1.50087,0.40569,-18.4]]},"sleeve_tear":{"t":[[0.0,0.16731,-17.5],[0.26731,0.2174,-19.6],[0.58471,0.26694,-19.9],[0.95165,0.31654,-17.8],[1.36819,0.36727,-16.3]]},"arm_rip":{"t":[[0.0,1.04715,-20.2]]},"hay_land":{"t":[[0.0,1.5374,-26.5]]},"birds_up":{"t":[[0.0,3.27127,-18.1]]},"eye_light":{"t":[[0.0,2.02656,-13.5]]},"step_dirt":{"t":[[0.0,0.19471,-22.1],[0.29471,0.19627,-18.9],[0.59098,0.23619,-21.6],[0.92717,0.19612,-21.7],[1.22329,0.21535,-20.3],[1.53865,0.19027,-21.6]]},"step_wet_stone":{"t":[[0.0,0.2936,-23.3],[0.3936,0.28935,-24.1],[0.78296,0.28279,-24.8],[1.16575,0.28656,-24.0],[1.55231,0.28713,-23.6],[1.93944,0.2865,-24.0]]},"step_wood":{"t":[[0.0,0.29219,-21.4],[0.39219,0.29033,-21.0],[0.78252,0.29377,-21.3],[1.17629,0.2725,-22.4],[1.54879,0.28992,-17.9],[1.93871,0.29631,-19.9]]},"step_tile":{"t":[[0.0,0.1861,-23.0],[0.2861,0.1909,-24.8],[0.577,0.20146,-24.8],[0.87846,0.19508,-20.0],[1.17354,0.1991,-23.4],[1.47265,0.19194,-23.1]]},"step_iron":{"t":[[0.0,0.3,-23.1],[0.4,0.23192,-25.9],[0.73192,0.29885,-22.9],[1.13077,0.29715,-25.8],[1.52792,0.28652,-24.4],[1.91444,0.29917,-24.2]]},"step_marble":{"t":[[0.0,0.28375,-21.4],[0.38375,0.27902,-25.6],[0.76277,0.28435,-26.3],[1.14712,0.28867,-24.7],[1.53579,0.28098,-26.1],[1.91677,0.27675,-23.9]]},"scuff":{"t":[[0.0,0.23642,-15.5],[0.33642,0.23935,-15.2],[0.67577,0.24271,-14.5],[1.01848,0.23321,-14.5]]},"step_goblin":{"t":[[0.0,0.16179,-21.0],[0.26179,0.18652,-21.9],[0.54831,0.08192,-20.0],[0.73023,0.19231,-22.2]]}}/*SFX_MAN_END*/;
const SFX={bufs:{},loading:{},bad:{},queue:[],busy:0,want:new Set(),last:{},voices:[],loops:{},bus:null,setKey:null,rev:null,tumble:new WeakMap(),body:new WeakMap(),feet:new WeakMap(),
  scuffT:new WeakMap(),scuffAll:-9,boltHit:null,arena:null,arenaT:-9,bed:null,clackD:0,clackT:0,heliT:-9,liftT:-9,startT:-9,gainK:1};
// how loud each recording plays (a gain on its takes, which are made to peak at -1 dBTP), before the master
const SFX_GAIN={swing_light:.32,swing_mid:.42,swing_heavy:.55,hit_cut:.8,hit_blunt:.8,hit_bullet:.75,crit_cut:.95,crit_blunt:.95,finish_through:.9,finish_neck:.9,
  clang:.55,clang_light:.4,shing:.45,crack:.7,bottle_smash:.75,drop_blade:.45,drop_gun:.45,thud_light:.45,thud:.7,thud_heavy:.9,thud_dirt:.7,thud_metal:.7,
  arc_unroll:.45,arc_lock:.4,arc_reroll:.42,arc_lash:.6,bolt:.5,bolt_hit:.5,gale:.7,blink:.5,vault:.4,wow:.45,
  shot_pistol:.8,shot_rifle:.9,shot_smg:.55,shot_mg:.8,gun_dryfire:.45,ricochet:.55,bullet_ground:.45,bullet_metal:.45,casing:.2,bullet_whiz:.4,
  glass_small:.6,glass_large:.8,glass_crunch:.45,china:.6,paper:.6,plaster:.75,door_swing:.55,table_topple:.75,table_break:.85,prop_tumble:.55,prop_break:.75,
  lamp_knock:.45,lamp_fall:.7,range_slam:.8,sizzle:.5,bike_start:.6,bike_rev_dirt:.7,maize_push:.5,bike_rev:.7,bike_crash:.8,road_tumble:.65,rifle_draw:.5,
  bike_into_apc:.95,boom_fuel:1,concrete_slam:.75,grenade_unclip:.45,grenade_pin:.45,grenade_bounce:.5,boom_grenade:1,wall_latch:.55,wall_slide:.6,lift_bell:.35,
  lift_doors:.45,train_depart:.7,rail_clack:.35,goblin_chitter:.5,goblin_drop:.55,goblin_squeal:.45,goblin_snarl:.4,goblin_death:.45,splat:.7,brake:.55,
  ixet_roar:.9,ixet_hiss:.55,tail_swing:.7,tail_writhe:.5,cage_gate:.6,freight_start:.65,coat_sweep:.5,coat_throw:.55,charge_plant:.5,charge_beep:.3,
  boom_breach:1,debris_rattle:.55,wood_clack:.35,chair_topple:.6,desk_slam:.95,over_desk:.7,window_crash:.95,wind_in:.6,heli_approach:.8,heli_door:.55,
  hex_charge:.55,hex_shot:1,hex_wound:.8,aether_drain:.55,over_edge:.6,pit_steel:.9,pit_wood:.85,pit_wood_break:.9,pit_car:.9,pit_pipe:.85,pit_neon:.85,
  pit_rock:.85,gravel:.5,spike_impale:.95,arm_tear:.6,sleeve_tear:.55,arm_rip:.85,hay_land:.9,birds_up:.6,eye_light:.35,
  step_dirt:.2,step_wet_stone:.2,step_wood:.2,step_tile:.18,step_iron:.18,step_marble:.18,scuff:.15,step_goblin:.16};
// the loops' loudness where they are heard at their fullest (LUFS before the master; the files hold -20)
const SFX_LOOP={amb_sundown_loop:-28,amb_field_loop:-28,amb_avenue_loop:-26,amb_checkpoint_loop:-28,amb_street_loop:-29,amb_dining_loop:-31,amb_kitchen_loop:-29,
  amb_station_loop:-29,amb_lobby_loop:-31,amb_office_loop:-31,amb_roof_loop:-27,fire_loop:-29,fall_wind_loop:-25,bike_loop_low:-25,bike_loop_high:-24,
  bike_rival_loop:-27,apc_idle_loop:-30,train_idle_loop:-30,rail_loop:-27,freight_loop:-28,heli_loop:-24};
const SFX_BED={sundown:'amb_sundown_loop',field:'amb_field_loop',chase:'amb_avenue_loop',roadblock:'amb_checkpoint_loop',vargo:'amb_street_loop',
  dining:'amb_dining_loop',kitchen:'amb_kitchen_loop',platform:'amb_station_loop',deep:'amb_station_loop',lobby:'amb_lobby_loop',office:'amb_office_loop',
  roof:'amb_roof_loop'};
// what each stage plays, loaded with it (and the next stage's, while this one plays); the fights' own are always kept
const SFX_FIGHT=['swing_light','swing_mid','swing_heavy','hit_cut','hit_blunt','crit_cut','crit_blunt','finish_through','finish_neck','clang','clang_light',
  'shing','crack','thud_light','thud','thud_heavy','arc_unroll','arc_lock','arc_reroll','arc_lash','bolt','bolt_hit','gale','blink','vault','wow','scuff',
  'drop_blade','bottle_smash'];
// the bistro's rooms: what breaks, tips and falls in any of them
const SFX_ROOMKIT=['glass_small','glass_large','glass_crunch','china','paper','plaster','door_swing','table_topple','table_break','prop_tumble','prop_break',
  'lamp_knock','lamp_fall','wood_clack'];
const SFX_STAGE={
  sundown:['amb_sundown_loop','bike_start','bike_loop_low','bike_loop_high','bike_rev_dirt'],
  field:['amb_field_loop','maize_push','thud_dirt','step_dirt','bike_start','bike_loop_low','bike_loop_high','bike_rev_dirt'],
  chase:['amb_avenue_loop','bike_loop_low','bike_loop_high','bike_rival_loop','bike_rev','bike_crash','road_tumble'],
  roadblock:['amb_checkpoint_loop','apc_idle_loop','shot_mg','bullet_ground','rifle_draw','bike_into_apc','shot_rifle','boom_fuel','fire_loop','shot_pistol','ricochet',
    'hit_bullet','casing','bullet_whiz','gun_dryfire','concrete_slam','drop_gun','grenade_unclip','step_wet_stone','bike_rev','bike_loop_low','bike_loop_high'],
  vargo:['amb_street_loop','grenade_unclip','grenade_pin','grenade_bounce','boom_grenade','step_wet_stone'],
  dining:['amb_dining_loop',...SFX_ROOMKIT,'step_wood'],
  kitchen:['amb_kitchen_loop','range_slam','sizzle',...SFX_ROOMKIT,'wall_latch','wall_slide','lift_bell','lift_doors','step_tile'],
  platform:['amb_station_loop','lift_bell','lift_doors','train_idle_loop','train_depart','rail_loop','rail_clack','step_tile'],
  line:['rail_loop','rail_clack','goblin_chitter','goblin_drop','goblin_squeal','goblin_snarl','goblin_death','splat','brake','thud_metal','step_iron','step_goblin'],
  deep:['amb_station_loop','brake','rail_loop','ixet_roar','ixet_hiss','tail_swing','tail_writhe','goblin_drop','goblin_squeal','goblin_snarl','goblin_death',
    'splat','cage_gate','freight_start','freight_loop','step_tile','step_goblin'],
  lobby:['amb_lobby_loop','lift_bell','lift_doors','coat_sweep','coat_throw','shot_smg','bullet_metal','gun_dryfire','drop_gun','casing','charge_plant',
    'charge_beep','boom_breach','debris_rattle',...SFX_ROOMKIT,'step_marble'],
  office:['amb_office_loop','chair_topple','desk_slam','over_desk','window_crash','wind_in',...SFX_ROOMKIT,'step_wood'],
  roof:['amb_roof_loop','heli_approach','heli_loop','heli_door','hex_charge','hex_shot','hex_wound','aether_drain','over_edge','step_marble'],
  fall:['fall_wind_loop','pit_steel','pit_wood','pit_wood_break','pit_car','pit_pipe','pit_neon','pit_rock','gravel','spike_impale','arm_tear','sleeve_tear',
    'arm_rip','hay_land','birds_up','eye_light']};
// the floor under a man's feet, by ground (and room)
const SFX_FLOOR={outskirts:'dirt',crops:'dirt',field:'dirt',hill:'dirt',wall:'dirt',yard:'dirt',roadblock:'wet_stone',street:'wet_stone',ledge:'wet_stone',
  stairs:'wet_stone',shelf:'wood',station:'tile',tunnel:'iron',roof:'marble',sumproof:'wood',sumpkitchen:'wood',backroom:'wood'};
const SFX_ROOMFLOOR={dining:'wood',kitchen:'tile',lobby:'marble',office:'wood'};

// ---------- loading ----------
function sfxCan(){return typeof AC!=='undefined'&&!!AC&&typeof fetch==='function'&&typeof location!=='undefined'&&/^https?:$/.test(location.protocol);}
function sfxReady(k){return !!SFX.bufs[k];}
// every recording goes out through one gain, which the sound switch closes at once
function sfxBus(){if(!SFX.bus){SFX.bus=AC.createGain();SFX.bus.connect(master);}return SFX.bus;}
function sfxPump(){while(SFX.busy<4&&SFX.queue.length){const k=SFX.queue.shift();if(SFX.bufs[k]||SFX.loading[k]||SFX.bad[k]||!SFX.want.has(k))continue;sfxFetch(k);}}
function sfxFetch(k){if(!SFX_MAN[k]||!sfxCan())return;SFX.loading[k]=true;SFX.busy++;const a=AC;
  const done=b=>{SFX.busy--;delete SFX.loading[k];if(b&&SFX.want.has(k))SFX.bufs[k]=b;else if(!b)SFX.bad[k]=true;sfxPump();};
  fetch('sfx/'+k+'.mp3').then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer();})
    .then(ab=>new Promise((ok,no)=>{try{const p=a.decodeAudioData(ab,ok,no);if(p&&p.catch)p.catch(no);}catch(e){no(e);}}))
    .then(b=>done(b),()=>done(null));}
// these and the fights' own are wanted now; anything else loaded is let go
function sfxWant(keys){const W=new Set([...SFX_FIGHT,...keys].filter(k=>SFX_MAN[k]));SFX.want=W;
  for(const k of Object.keys(SFX.bufs))if(!W.has(k)&&!SFX.voices.some(v=>v.key===k)&&!Object.values(SFX.loops).some(L=>L.key===k))delete SFX.bufs[k];
  SFX.queue=[...keys,...SFX_FIGHT].filter((k,i,a)=>SFX_MAN[k]&&a.indexOf(k)===i&&!SFX.bufs[k]);sfxPump();}
// what the page is showing wants: the stage and the one after it, or a lab bout's ground
function sfxSetFor(){const SV=S.story;
  if(SV&&SV.key){const st=STAGES[stageIx(SV.key)],nx=st&&st.next;return[...(SFX_STAGE[SV.key]||[]),'step_'+sfxFloor(),...(nx&&SFX_STAGE[nx]||[])];}
  const f=sfxFloor(),r=S.arenaKey==='restaurant'?S.room||'dining':'';const room=r==='dining'?SFX_STAGE.dining:r==='kitchen'?SFX_STAGE.kitchen:r==='lobby'?SFX_STAGE.lobby:r==='office'?SFX_STAGE.office:[];
  const guns=S.F.some(f=>f.wp&&f.wp.gun)?['shot_pistol','shot_rifle','shot_smg','hit_bullet','gun_dryfire','bullet_ground','bullet_whiz','casing']:[];
  return['step_'+f,...room,...guns];}

// ---------- playing ----------
function sfxPick(k,n){const L=SFX.last[k];let i=Math.floor(uiRand()*n);if(n>1&&i===L)i=(i+1+Math.floor(uiRand()*(n-1)))%n;SFX.last[k]=i;return i;}
// the takes of a sound played at one loudness: each brought toward the middle one's, by no more than a few dB
function sfxTakeGain(m,i){if(!m.tg){const ls=m.t.map(t=>t[2]).sort((a,b)=>a-b),mid=ls[ls.length>>1];m.tg=m.t.map(t=>clamp(Math.pow(10,(mid-t[2])/20),.7,1.4));}return m.tg[i];}
const SFX_CAP={shot_smg:6,shot_mg:5,casing:2,bullet_metal:4,bullet_ground:4,rail_clack:3,step_goblin:4};
function sfxShot(k,o){o=o||{};const b=SFX.bufs[k],m=SFX_MAN[k];if(!b||!m||!m.t)return false;if(!S.soundOn||AC.state!=='running')return true;
  const a=AC,n=m.t.length,i=o.take!=null?clamp(o.take|0,0,n-1):sfxPick(k,n),[off,dur]=m.t[i],from=Math.min(o.from||0,dur-.02),len=Math.min(dur-from,o.dur||1e9);
  const rate=clamp((o.rate||1)*(o.tone===false?1:1+(uiRand()-.5)*.05),.4,3),t0=a.currentTime+(o.delay||0),lv=(SFX_GAIN[k]??.5)*sfxTakeGain(m,i)*(o.g??1)*SFX.gainK;
  const src=a.createBufferSource(),g=a.createGain();src.buffer=b;src.playbackRate.value=rate;g.gain.value=lv;
  if(o.dur){const e=t0+len/rate;g.gain.setValueAtTime(lv,Math.max(t0,e-.04));g.gain.linearRampToValueAtTime(0,e);}
  src.connect(g);g.connect(sfxBus());src.start(t0,off+from,len);
  const V={src,g,key:k,t0};SFX.voices.push(V);src.onended=()=>{const j=SFX.voices.indexOf(V);if(j>=0)SFX.voices.splice(j,1);try{g.disconnect();}catch(e){}};
  // too many of one sound, or of all of them: the oldest goes
  const cap=SFX_CAP[k]||4,mine=SFX.voices.filter(v=>v.key===k);if(mine.length>cap)sfxCut(mine[0]);if(SFX.voices.length>40)sfxCut(SFX.voices[0]);
  return true;}
function sfxCut(V){const j=SFX.voices.indexOf(V);if(j>=0)SFX.voices.splice(j,1);try{const t=AC.currentTime;V.g.gain.setTargetAtTime(0,t,.01);V.src.stop(t+.06);}catch(e){}}
// a held loop: one voice looping inside the file's window, its level and pitch set every frame; quiet a while, it is let go
function sfxLoop(id,k,lv,rate,tc){let L=SFX.loops[id];const on=lv>.0005&&S.soundOn&&!(typeof document!=='undefined'&&document.hidden);
  if(L&&L.key!==k){sfxLoopEnd(id,.4);L=null;}
  if(!L){if(!on||!SFX.bufs[k]||!AC||AC.state!=='running')return false;const m=SFX_MAN[k],a=AC,src=a.createBufferSource(),g=a.createGain();src.buffer=SFX.bufs[k];
    src.loop=true;src.loopStart=m.l[0];src.loopEnd=m.l[1];g.gain.value=0;src.connect(g);g.connect(sfxBus());
    src.start(a.currentTime,m.l[0]+uiRand()*(m.l[1]-m.l[0]));L=SFX.loops[id]={key:k,src,g,quiet:null};}
  const t=AC.currentTime;L.g.gain.setTargetAtTime(on?lv:0,t,tc||.15);if(rate)L.src.playbackRate.setTargetAtTime(rate,t,.12);
  if(on)L.quiet=null;else if(L.quiet==null)L.quiet=t;else if(t-L.quiet>2.5)sfxLoopEnd(id,0);
  return true;}
function sfxLoopEnd(id,fade){const L=SFX.loops[id];if(!L)return;delete SFX.loops[id];try{const t=AC.currentTime;if(fade)L.g.gain.setTargetAtTime(0,t,fade/3);L.src.stop(t+(fade||0)+.05);}catch(e){}}
function sfxLoopLv(k){return Math.pow(10,((SFX_LOOP[k]??-30)+20)/20)*SFX.gainK;}

// ---------- which recording a call is ----------
function sfxFloor(){if(S.arenaKey==='restaurant')return SFX_ROOMFLOOR[S.room]||'wood';return SFX_FLOOR[S.arenaKey]||'wet_stone';}
function sfxClass(A){const w=A&&A.wp;if(!w)return'blunt';if(w.gun)return'gun';return w.edge?'cut':'blunt';}
function sfxBody(v){return v<170?'thud_light':v<360?'thud':'thud_heavy';}
function sfxRoute(k,v,c){c=c||{};const SK=S.story&&S.story.key,A=c.A||null;
  if(S.arenaKey!==SFX.arena){SFX.arena=S.arenaKey;SFX.arenaT=S.t;}
  if('s' in c)return c.s?{s:c.s,o:c}:false;
  if(c.skip)return sfxReady(c.skip)?false:null;
  switch(k){
    case'swoosh':{const m=typeof v==='number'?v:1;
      if(A&&A.beast==='goblin'&&uiRand()<.4)sfxShot('goblin_snarl',{g:.8,delay:.02});
      if(A&&A.beast==='lizard'&&uiRand()<.35)sfxShot('ixet_hiss',{g:.7});
      return{s:m<.9?'swing_light':m<2.2?'swing_mid':'swing_heavy',o:{g:clamp(.75+m*.12,.7,1.15)}};}
    case'hit':case'crit':{const crit=k==='crit',ex=S.game&&S.game.ex,bh=SFX.boltHit;
      // (an elven bolt's own burst carries the blow it lands: the first one after it, that frame)
      if(bh&&bh.t===S.t&&(!c.D||!bh.D||c.D===bh.D)){SFX.boltHit=null;if(sfxReady('bolt_hit'))return false;}
      const cl=c.pit?'blunt':sfxClass(A||(ex&&ex.A)),d=typeof v==='number'?v:10;
      const s=cl==='gun'?'hit_bullet':crit?(cl==='cut'?'crit_cut':'crit_blunt'):(cl==='cut'?'hit_cut':'hit_blunt');
      return{s,o:{g:clamp(.65+d/40,.7,1.15)*(crit&&cl==='gun'?1.15:1)}};}
    case'clang':return{s:v>=.6?'clang':'clang_light',o:{g:clamp(.6+v*.45,.65,1.1)}};
    case'thud':{const w=typeof v==='number'?v:200,fl=sfxFloor();
      if(c.tumble){const t=SFX.tumble.get(c.tumble);if(t!=null&&S.t-t<1.6)return sfxReady('road_tumble')?false:null;if(sfxReady('road_tumble')){SFX.tumble.set(c.tumble,S.t);return{s:'road_tumble'};}return null;}
      const s=w>=170&&fl==='dirt'?'thud_dirt':w>=170&&fl==='iron'?'thud_metal':sfxBody(w);
      // a body coming down: one sound for the whole of it, and none for the jolt of a scene put in place
      if(c.body&&sfxReady(s)){const t=SFX.body.get(c.body);if(S.t-SFX.arenaT<.3||(t!=null&&S.t-t<.22))return false;SFX.body.set(c.body,S.t);}
      return{s,o:{g:clamp(.55+w/700,.6,1.15)}};}
    case'crack':return{s:'crack',o:{g:clamp(.5+v*.5,.6,1.2)}};
    case'glass':return{s:v>=1.2?'glass_large':v<=.3?'glass_crunch':'glass_small',o:{g:clamp(.5+v*.4,.6,1.2)}};
    case'china':return{s:'china'};
    case'paper':return{s:'paper',o:{g:clamp(.4+v*.5,.5,1.2)}};
    case'plaster':return{s:SK==='roadblock'||S.arenaKey==='roadblock'?'concrete_slam':'plaster',o:{g:clamp(.45+v*.5,.6,1.2)}};
    case'wood':{if(c.door)return{s:c.door==='lobby'?'lift_bell':'door_swing'};if(c.clack)return{s:'wood_clack',o:{g:clamp(v*1.6,.5,1.1)}};
      return{s:v>=1.2?'prop_break':'wood_clack',o:{g:clamp(.5+v*.4,.6,1.2)}};}
    case'shing':return{s:'shing',o:{g:clamp(v,.5,1)}};
    case'unroll':return{s:'arc_unroll'};
    case'lock':return{s:'arc_lock',o:{g:clamp(v,.5,1)}};
    case'reroll':return{s:'arc_reroll'};
    case'sizzle':return{s:'sizzle',o:{g:clamp(v,.6,1.3)}};
    case'vault':return{s:'vault',o:{g:clamp(v,.5,1.1)}};
    case'bolt':case'gale':case'blink':case'wow':return{s:k};
    case'bolt_hit':SFX.boltHit={t:S.t,D:c.D||null};return{s:'bolt_hit'};
    case'roar':return{s:'ixet_roar'};
    case'tail':return{s:'tail_swing'};
    case'squeal':return{s:'goblin_squeal',o:{g:clamp(v,.6,1)}};
    case'splat':return{s:'splat'};
    case'shot':{const kd=v;if(kd==='hex')return sfxReady('hex_shot')?false:null;
      const s=kd==='rifle'?'shot_rifle':kd==='smg'?'shot_smg':kd==='mg'?'shot_mg':'shot_pistol';
      if((kd==='pistol'||kd==='smg')&&uiRand()<(kd==='smg'?.3:.8))sfxShot('casing',{delay:.45+uiRand()*.3,g:.8});
      return{s};}
    case'click':return{s:'gun_dryfire'};
    case'beep':return{s:'charge_beep',o:{rate:clamp(v||1,.8,1.8),tone:false}};
    case'boom':return{s:c.kind==='grenade'?'boom_grenade':c.kind==='fuel'?'boom_fuel':'boom_breach'};
    case'rattle':return{s:'debris_rattle'};
    case'engine':return{s:'bike_start'};
    case'rev':return{s:S.arenaKey==='outskirts'||S.arenaKey==='crops'?'bike_rev_dirt':'bike_rev',o:{g:clamp(v,.6,1)}};
    case'gravel':return{s:'gravel'};
    case'brake':return{s:'brake'};
    case'gate':return SK==='deep'?{s:'cage_gate',o:c}:null;
    case'lift':return{s:'freight_start'};
    case'heli':return{s:'heli_approach'};
    case'charge':return{s:'hex_charge'};
    case'hex':return{s:'hex_shot'};
    case'clink':return{s:'grenade_bounce'};
    case'ping':return{s:'ricochet'};
    case'ding':case'chime':case'arrive':return{s:'lift_bell'};
    case'grind':return{s:'wall_slide'};
    case'crash':return{s:'bike_crash'};
    case'impale':return{s:'spike_impale'};
    case'tear':return{s:'arm_tear',o:{take:c.take}};
    case'cloth':return{s:'sleeve_tear',o:{take:c.take??4}};
    case'rip':return{s:'arm_rip'};
    case'hay':return{s:'hay_land'};
    case'birds':return{s:'birds_up'};
  }
  // a new moment's own recording, by its name
  return SFX_MAN[k]?{s:k,o:c}:null;}
// (the main UI and the features have set their hooks: this wraps them last, so it hears every call first)
V11UI.init.push(()=>{const sd=S.hooks.sound;S.hooks.sound=(k,v,c)=>{
  if(k==='engine')SFX.startT=S.t;else if(k==='heli')SFX.heliT=S.t;else if(k==='lift')SFX.liftT=S.t;
  if(!S.soundOn)return;
  let r=null;try{r=sfxCan()?sfxRoute(k,v,c):null;}catch(e){r=null;}
  if(r===false)return;
  if(r&&sfxShot(r.s,r.o))return;
  if(r&&SFX_MAN[r.s]&&!sfxReady(r.s)&&sfxCan()&&!SFX.bad[r.s]){SFX.want.add(r.s);if(!SFX.queue.includes(r.s))SFX.queue.push(r.s);sfxPump();}
  sd(k,v);};
  // a goblin killed screeches as it goes (one cut in half splats instead)
  V11.kill.push(D=>{if(D&&D.beast==='goblin'&&!S.warming&&S.soundOn&&!(SFX.voices.some(v=>v.key==='splat'&&AC&&AC.currentTime-v.t0<.15)))sfxShot('goblin_death',{delay:.04});});});

// ---------- the held sounds ----------
// The synthesized engine, rails and wind stand down while their recordings are loaded (their voices are kept at nothing).
{const ef=engineFrame;engineFrame=function(){if(!(sfxReady('bike_loop_low')&&sfxReady('bike_loop_high')&&sfxCan())){sfxBikes(false);return ef();}engineStop();sfxBikes(true);};}
{const rf=railFrame;railFrame=function(){if(!(sfxReady('rail_loop')&&sfxCan())){sfxLoop('rail','rail_loop',0);return rf();}if(RAIL)RAIL.g.gain.setTargetAtTime(0,RAIL.a.currentTime,.2);sfxRails();};}
{const wf=windFrame;windFrame=function(){if(!(sfxReady('amb_sundown_loop')&&sfxCan()))return wf();if(WIND)WIND.g.gain.setTargetAtTime(0,WIND.a.currentTime,.3);};}
// the bikes: his own on the low and high loops by its speed (the road's too, in the chase), the riders' on theirs
function sfxBikes(on){const bikes=on&&S.soundOn?S.veh.filter(v=>v.kind==='bike'&&v.run>0&&v.x>-400&&v.x<W+400):[],K=hero(),mine=bikes.find(B=>K&&K.mount===B)||bikes.find(B=>S.story&&B===S.story.bike)||null;
  if(mine){const road=S.arena&&S.arena.scroll?Math.abs(S.scrollV||0)*.35:0,sp=clamp((Math.abs(mine.vx||0)+road)/360,0,1),rv=mine.rev||0,far=mine.x>W+60||mine.x<-160?.25:1,
      lv=mine.run*far,wake=clamp((S.t-SFX.startT-.45)/.6,0,1);
    sfxLoop('bikeLo','bike_loop_low',sfxLoopLv('bike_loop_low')*Math.cos(sp*Math.PI/2)*lv*wake,.8+.9*sp+.25*rv);
    sfxLoop('bikeHi','bike_loop_high',sfxLoopLv('bike_loop_high')*Math.sin(sp*Math.PI/2)*lv*wake,.78+.3*sp+.12*rv);}
  else{sfxLoop('bikeLo','bike_loop_low',0);sfxLoop('bikeHi','bike_loop_high',0);}
  const riders=bikes.filter(B=>B!==mine);let near=null,nd=1e9;for(const B of riders){const d=Math.abs(B.x-cam.x);if(d<nd){nd=d;near=B;}}
  if(near&&sfxReady('bike_rival_loop')){const road=S.arena&&S.arena.scroll?Math.abs(S.scrollV||0)*.35:0,sp=clamp((Math.abs(near.vx||0)+road)/360,0,1),far=near.x>W+60||near.x<-160?.3:1;
    sfxLoop('rival','bike_rival_loop',sfxLoopLv('bike_rival_loop')*near.run*far*(.6+.4*sp)*(riders.length>1?1.15:1),.85+.3*sp);}
  else sfxLoop('rival','bike_rival_loop',0);}
// the rails: the rumble opening up with the speed, the joints going under the wheels; the engine ticking over at the platform
function sfxRails(){const T=S.veh.find(v=>v.kind==='train'),sp=T?Math.abs(T.v||0):S.arenaKey==='tunnel'&&S.story?Math.abs(S.scrollV||0):0,k=clamp(sp/900,0,1);
  const dt=clamp(S.t-SFX.clackT,0,.1);SFX.clackT=S.t;
  sfxLoop('rail','rail_loop',sp<1?0:sfxLoopLv('rail_loop')*(.25+.75*k)*(1-.7*clamp(S.fade,0,1)),.78+.35*k,.25);
  SFX.clackD+=sp*dt;if(SFX.clackD>316){SFX.clackD-=316;if(S.soundOn&&sp>40)sfxShot('rail_clack',{g:.45+.55*k,rate:.9+.25*k});}}
function sfxHeld(){const SV=S.story,SK=SV&&SV.key,K=hero(),fadeK=1-.85*clamp(S.fade,0,1);
  // the stage's background, crossfaded from the last
  const bed=SV&&SFX_BED[SK]||null;
  if(bed!==SFX.bed&&SFX.bed)sfxLoop('bed:'+SFX.bed,SFX.bed,0,null,.6);
  SFX.bed=bed;if(bed)sfxLoop('bed:'+bed,bed,sfxLoopLv(bed)*fadeK,null,.8);
  for(const id of Object.keys(SFX.loops))if(id.startsWith('bed:')&&id!=='bed:'+bed)sfxLoop(id,SFX.loops[id].key,0,null,.6);
  // the carrier idling until the blast, then its fire
  const apc=SK==='roadblock'&&S.veh.find(v=>v.kind==='apc');
  sfxLoop('apc','apc_idle_loop',apc&&!apc.wreck?sfxLoopLv('apc_idle_loop')*(apc.x>W+200?.4:1):0,null,.2);
  const fires=SV&&S.fires&&S.fires.length?S.fires.length:0;sfxLoop('fire','fire_loop',fires?sfxLoopLv('fire_loop')*Math.min(1,.6+.25*fires)*fadeK:0,null,.6);
  // the engine of the family's train at the platform, waiting
  const T=S.veh.find(v=>v.kind==='train');sfxLoop('train','train_idle_loop',T&&SK==='platform'&&Math.abs(T.v||0)<1?sfxLoopLv('train_idle_loop')*(.35+.65*clamp(T.lamp||0,0,1))*fadeK:0,null,.4);
  // the freight lift going up out of the deep
  sfxLoop('freight','freight_loop',SK==='deep'&&K&&K.rideLift&&S.t-SFX.liftT>.5?sfxLoopLv('freight_loop')*fadeK:0,null,.3);
  // the helicopter in its hover over the pad (after its approach)
  const H=SK==='roof'&&S.veh.find(v=>v.kind==='heli');sfxLoop('heli','heli_loop',H&&H.x>-200&&S.t-SFX.heliT>4.4?sfxLoopLv('heli_loop')*fadeK:0,null,.6);
  // the fall: the wind of it until he is in the hay (down the face it goes with the speed of the fall: quieter and lower as the memory
  // slows it, back to all of it before the Pit)
  const P=S.pit,th=SK==='fall'&&!!P&&!P.on,fk=th?clamp(Math.abs(S.scrollYV||0)/1800,0,1):1;
  sfxLoop('fall','fall_wind_loop',SK==='fall'&&(!P||P.stage!=='landed')?sfxLoopLv('fall_wind_loop')*(1-clamp(S.fade,0,1)*.6)*(.4+.6*fk):0,th?.78+.22*fk:1,P&&P.stage==='landed'?.25:.5);}
// the arc-blade rolling back up after a fight (the scene's roll-up: f.arcRev)
function sfxRoll(){const K=hero();if(!K||!K.arcRev||K.arcRev===SFX.rev)return;if(S.t<K.arcRev.t0-.02)return;SFX.rev=K.arcRev;if(S.soundOn)sfxShot('arc_reroll');}
// footsteps: each step a man takes (f.steps, the game's own: a step put down when it finishes), by what the floor is and how long
// the stride; fight footwork scuffs
function sfxSteps(){if(!S.soundOn||!sfxCan())return;const fl=sfxFloor(),ok=sfxReady('step_'+fl),gob=sfxReady('step_goblin');if(!ok&&!gob)return;
  const vx0=cam.x-cam.viewW/2-60,vx1=cam.x+cam.viewW/2+60,quiet=S.arenaKey==='chase'||S.arenaKey==='fall';
  for(const f of S.F){if(!f.steps)continue;let st=SFX.feet.get(f);if(!st){st={s:[null,null],a:[false,false],t:-9};SFX.feet.set(f,st);}
    const off=quiet||f.hidden||f.dead||f.downed||f.mount||f.inHeli||f.perch||f.gone||f.crashed||f.bed||(f.motor??1)<.45,g=f.beast==='goblin';
    for(let j=0;j<2;j++){const s=f.steps[j];if(!s)continue;
      if(!off&&s===st.s[j]&&st.a[j]&&!s.active&&s.to&&s.from&&S.t-st.t>.08&&(g?gob:ok)){const x=prjX(s.to.x,f.dep);
        if(x>vx0&&x<vx1){st.t=S.t;const d=Math.abs(s.to.x-s.from.x);
          sfxShot(g?'step_goblin':'step_'+fl,{g:clamp(.45+d/110,.45,1.05)*(f.beast==='lizard'?1.4:1),rate:f.beast==='lizard'?.82:1});}}
      st.s[j]=s;st.a[j]=!!s.active;}
    // a quick shuffle on the floor in a fight: a scuff now and then
    if(off||!S.game||S.game.phase!=='exchange'||S.t-(SFX.scuffT.get(f)??-9)<.9||S.t-SFX.scuffAll<.25||!sfxReady('scuff'))continue;
    for(const ix of [FTF,FTB]){const q=f.p[ix];if(q&&q.y>=f.gr(q.x)-(q.r||0)-1.5&&Math.abs((q.x-q.px)/DT)>150){SFX.scuffT.set(f,S.t);SFX.scuffAll=S.t;sfxShot('scuff',{g:.7});break;}}}}
// what the page shows decides what is loaded
function sfxSets(){const SV=S.story,key=(SV&&SV.key?'st:'+SV.key:'lab:'+S.arenaKey+':'+(S.arenaKey==='restaurant'?S.room:''))+':'+(S.F.some(f=>f.wp&&f.wp.gun)?'g':'');
  if(key===SFX.setKey)return;SFX.setKey=key;sfxWant(sfxSetFor());}
V11UI.tick.push(()=>{if(!sfxCan())return;sfxSets();sfxPump();if(SFX.bus)SFX.bus.gain.setTargetAtTime(S.soundOn?1:0,AC.currentTime,.02);
  try{sfxHeld();sfxRoll();sfxSteps();}catch(e){}});
// the story's moments the held sounds count from; leaving the story lets every one of them go
{const sh=S.hooks.story;S.hooks.story=(k,a)=>{sh(k,a);if(k==='quit'||k==='end'){for(const id of Object.keys(SFX.loops))sfxLoopEnd(id,.5);SFX.bed=null;}};}
// ===== SAMPLED SOUND END =====
