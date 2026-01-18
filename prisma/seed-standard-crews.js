// Seed script to add standard crews to existing Trade Teams
// Per USLDC-2230-E Guidelines (October 2025)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STANDARD_TRADE_TEAMS = [
  {
    name: 'Electrical',
    description: 'Installation and commissioning of electrical systems including power distribution, lighting, low-voltage systems, audio/video, and utilities connections.',
    crews: [
      { name: 'Audio & video', isRequired: true, scopeOfWork: 'Installation and commissioning of the audio/video system and any computer equipment' },
      { name: 'Electrical commissioning', isRequired: true, scopeOfWork: 'Commissioning of the electrical system, equipment, and appliances. Excludes commissioning of audio/video system and computer equipment.' },
      { name: 'Electrical finish', isRequired: true, scopeOfWork: 'Installation of outlets, switches, light fixtures, and appliances. Also includes site lighting fixtures.' },
      { name: 'Electrical low-voltage', isRequired: true, scopeOfWork: 'Installation of systems and equipment for data, fire detection, fire alarm, security, and telephone' },
      { name: 'Electrical rough-in', isRequired: true, scopeOfWork: 'Installation of above grade conduit, raceways, ducts, cable trays, and wiring within building structures' },
      { name: 'Electrical utilities', isRequired: true, scopeOfWork: 'Installation of underground and under slab electrical related items including site service connection, building service entrance, rough-in for site lighting, solar systems, and vehicle chargers' }
    ]
  },
  {
    name: 'Exteriors',
    description: 'Exterior finishing work including roofing, windows, scaffolding, siding, and exterior specialties such as signage and metalwork.',
    crews: [
      { name: 'Exterior specialties', isRequired: true, scopeOfWork: 'Installation of parking, monument, building exterior, and other exterior signage. Includes metal handrails and other exterior metalwork, mailbox.' },
      { name: 'Roofing', isRequired: true, scopeOfWork: 'Installation of roofing system components including substrate boards, insulation, vapor retarder, air/moisture barrier, expansion joints, flashing and trim, copings, gravel stops, cupolas, curbs, vents, snow guards, fixed roof ladders, permanent fall protection devices, and roof windows/skylights/hatches/smoke vents' },
      { name: 'Scaffolding', isRequired: true, scopeOfWork: 'On-site erecting, dismantling, and moving of scaffolding' },
      { name: 'Windows', isRequired: true, scopeOfWork: 'Installation of interior and exterior windows including glazing, operating hardware, screens, accessories. Excludes building storefront and storefront wall systems.' },
      { name: 'Masonry', isRequired: false, scopeOfWork: 'Installation of concrete masonry unit and brick and stone veneer. Includes reinforcement, tie system, filling, grout.' },
      { name: 'Siding', isRequired: false, scopeOfWork: 'Installation of siding, soffit, exterior ceilings, fascia, gutters' },
      { name: 'Stucco/EIFS', isRequired: false, scopeOfWork: 'Installation of cementitious and synthetic stucco veneer systems; exterior insulation and finish system (EIFS). Includes insulation board, wall membranes, cement board substrate, reinforcing mesh.' }
    ]
  },
  {
    name: 'Interiors',
    description: 'Interior finishing work including drywall, paint, flooring, doors, ceilings, tile, carpentry, and toilet partitions.',
    crews: [
      { name: 'Carpet', isRequired: true, scopeOfWork: 'Installation of tile and sheet carpeting. Includes vinyl wall base, slab surface applied moisture or vapor barriers.' },
      { name: 'Doors', isRequired: true, scopeOfWork: 'Installation of interior and exterior doors. Includes frames, glazing, accessories, finishing, trim, weather stripping, louvers, door operators, wall bumpers, door and frame protection.' },
      { name: 'Drywall', isRequired: true, scopeOfWork: 'Hanging, finishing, sanding gypsum wallboard. Includes plaster and cement backerboard, firestopping.' },
      { name: 'Finish carpentry', isRequired: true, scopeOfWork: 'Installation of interior architectural woodwork including benches, cabinetry and countertops, casework, information board, railings and handrails, shelving, wardrobe and closet units, coat racks.' },
      { name: 'Interior specialties', isRequired: true, scopeOfWork: 'Installation of miscellaneous architectural items including artwork and decorative wall-hangings, auditorium seating, chairs, tables, lamps, lecterns, furnishing accessories, moveable rugs and mats, interior planters, artificial plants, door and window solar control film, fire extinguisher, movable furniture, signage, window blinds, curtains and drapes, interior shutters, shades.' },
      { name: 'Paint', isRequired: true, scopeOfWork: 'Installation of interior and exterior paint and coatings. Includes stains, varnishes, lacquers, epoxy, resinous, other fluid applied floor finishes, intumescent fireproofing.' },
      { name: 'Suspended ceiling', isRequired: true, scopeOfWork: 'Installation of suspended acoustical ceiling tiles, suspension system, hangers' },
      { name: 'Tile', isRequired: true, scopeOfWork: 'Ceramic and porcelain floor and wall tile. Includes laminate flooring and related finish sealers, furring, acoustic underlayment.' },
      { name: 'Toilet partitions', isRequired: true, scopeOfWork: 'Installation of manufactured toilet compartments. Includes doors (including tub doors), trim, hardware, toilet/bath/laundry accessories such as toilet paper holders, soap and paper dispensers, shower curtain bars, grab bars, shower and towel bars, mirrors, baby care stations.' }
    ]
  },
  {
    name: 'Mechanical',
    description: 'HVAC systems installation including rough-in, finish, and commissioning of heating, cooling, and air-handling equipment.',
    crews: [
      { name: 'HVAC commissioning', isRequired: true, scopeOfWork: 'Testing, balancing, and commissioning of the HVAC system' },
      { name: 'HVAC finish', isRequired: true, scopeOfWork: 'Installation of heating, cooling, air-handling, and variable air volume units. Includes coils, dampers, ducts, registers, grills, accessories, instrumentation, controls, humidity control equipment, dedicated outside air systems, air-to-air energy recovery units.' },
      { name: 'HVAC rough-in', isRequired: true, scopeOfWork: 'Installation of fans, ducts, plenums, supports, dampers and louvers within building structures. Includes breechings, chimneys, stacks, HVAC demolition.' },
      { name: 'Elevator', isRequired: false, scopeOfWork: 'Installation of elevators. Includes wheelchair lifts, testing, balancing, and commissioning.' }
    ]
  },
  {
    name: 'Plumbing',
    description: 'Plumbing systems installation including rough-in, finish, utilities, and commissioning of water supply, drainage, and gas systems.',
    crews: [
      { name: 'Plumbing finish', isRequired: true, scopeOfWork: 'Installation of fixtures (water closets, urinals, sinks, showers, bathtubs, drinking fountains, eyewash stations). Includes water treatment equipment, miscellaneous equipment (pumps, storage tanks, water heaters, heat exchangers), system commissioning.' },
      { name: 'Plumbing rough-in', isRequired: true, scopeOfWork: 'Installation of above grade piping, fittings, valves, insulation, and supports within building structures for domestic hot and cold-water distribution, sanitary waste and related vents, fuel-oil, natural-gas, liquefied-petroleum fuel systems. Includes system testing.' },
      { name: 'Plumbing utilities', isRequired: true, scopeOfWork: 'Installation of underground and under slab plumbing-related items. Includes domestic water, sanitary waste, fuel oil, natural gas, liquefied-petroleum site service connections, building service entrance. Excludes irrigation.' },
      { name: 'Fire sprinkler', isRequired: false, scopeOfWork: 'Installation of systems that use water or other methods for fire extinguishing and suppression, including sprinklers, fire pumps, piping, fittings, valves, cabinets, hoses, controls. Includes testing, balancing, and commissioning.' }
    ]
  },
  {
    name: 'Site/Civil',
    description: 'Site preparation and civil infrastructure including earthwork, landscaping, tree clearing, paving, and underground utilities.',
    crews: [
      { name: 'Earthwork', isRequired: true, scopeOfWork: 'Moving earth to establish new contours and elevations, including grading, excavation and fill, embankments, erosion and sedimentation controls, soil remediation, soil stabilization, rock stabilization, soil reinforcement, slope protection, gabions, wetlands, earth dams, site soil treatment. Includes piping and structures to collect moisture and water, damp-proofing, waterproofing, insulation, vapor retarder below grade.' },
      { name: 'Landscaping', isRequired: true, scopeOfWork: 'Installation of landscaping, including soil preparation, lawns and grasses, seeding and sodding, trees, plants, transplanting. Includes planting accessories, tree grates, prefabricated planters, landscape edging, decorative boulders, irrigation piping, valves, sprinkler, fittings, pumps, electrical wiring and conduit, controls, system commissioning.' },
      { name: 'Tree clearing', isRequired: true, scopeOfWork: 'Removal and disposal of trees and shrubs. Trimming of existing trees and shrubs that will remain.' },
      { name: 'Asphalt coating', isRequired: false, scopeOfWork: 'Installation of asphalt coating and crack fill by LDC volunteers' },
      { name: 'Asphalt pavement', isRequired: false, scopeOfWork: 'Installation of asphalt pavement by LDC volunteers' },
      { name: 'Concrete', isRequired: false, scopeOfWork: 'Installation of concrete foundations, slabs, cast-in-place, site curbing. Includes layout, excavation, subbase, fine grading, soil treatment, compaction, vapor retarder/barrier, forming, isolation joint, reinforcing, embedment, joint sealant. Coordinating concrete boom pump and laser screed contractor activities.' },
      { name: 'Fence', isRequired: false, scopeOfWork: 'Installation of permanent chain link, metal, wood, or other fencing, including gates and gate operators' },
      { name: 'Pavement striping', isRequired: false, scopeOfWork: 'Installation of painted markings and striping on pedestrian walkways and pavement' },
      { name: 'Septic', isRequired: false, scopeOfWork: 'Installation and commissioning of the septic system' }
    ]
  },
  {
    name: 'Site Support',
    description: 'General site support services including equipment maintenance, project logistics, material handling, and transportation.',
    crews: [
      { name: 'Equipment & vehicle maintenance', isRequired: true, scopeOfWork: 'Regular maintenance and repair of all LDC-owned equipment, vehicles, trailers' },
      { name: 'Project support', isRequired: true, scopeOfWork: 'Performing on-site setup, operation, and disassembly activities including temporary site structures, construction debris disposal, heated working environments, portable toilets, temporary safety protection, temporary security fences and gates, trailers or containers, forklift operation for on-site material logistics. May include general site cleanup, material or other courier activities, material receiving and storage activities.' },
      { name: 'Trucking', isRequired: true, scopeOfWork: 'Over-the-road towing of LDC-owned trailers, equipment, and materials' }
    ]
  },
  {
    name: 'Structural',
    description: 'Structural work including framing, demolition, insulation, remediation, and rigging of heavy materials and equipment.',
    crews: [
      { name: 'Demolition', isRequired: true, scopeOfWork: 'Removal and disposal of all or part of the building structure' },
      { name: 'Framing', isRequired: true, scopeOfWork: 'All wood and metal structural framing' },
      { name: 'Insulation', isRequired: true, scopeOfWork: 'Installation of above grade weather and acoustic insulation for interior/exterior walls, ceiling, attic. Excludes insulation that is part of a roofing system.' },
      { name: 'Remediation', isRequired: true, scopeOfWork: 'Remediation, removal, and disposal of mold or other contaminated materials. Excludes soil remediation.' },
      { name: 'Rigging', isRequired: false, scopeOfWork: 'Lifting and moving heavy building materials and equipment. Excludes coordinating the activities of concrete boom pump contractors.' }
    ]
  }
];

// Map for matching trade team names (handle Site/Civil vs Sitework/Civil)
const TRADE_TEAM_NAME_MAP = {
  'Sitework/Civil': 'Site/Civil',
  'Site/Civil': 'Site/Civil'
};

async function seedStandardCrews() {
  console.log('🔧 Seeding standard crews for existing Trade Teams...\n');
  console.log('Per USLDC-2230-E Guidelines (October 2025)\n');

  // Get all trade teams
  const tradeTeams = await prisma.tradeTeam.findMany({
    include: {
      crews: true,
      constructionGroup: true
    }
  });

  console.log(`Found ${tradeTeams.length} Trade Teams\n`);

  let totalCrewsCreated = 0;
  let teamsUpdated = 0;

  for (const tradeTeam of tradeTeams) {
    // Find matching standard trade team
    const normalizedName = TRADE_TEAM_NAME_MAP[tradeTeam.name] || tradeTeam.name;
    const standardTeam = STANDARD_TRADE_TEAMS.find(t => t.name === normalizedName);
    
    if (!standardTeam) {
      console.log(`⚠️  No standard definition for: ${tradeTeam.name}`);
      continue;
    }

    console.log(`\n📍 ${tradeTeam.name} (CG: ${tradeTeam.constructionGroup?.code || 'N/A'})`);
    
    // Update trade team description if empty or different
    if (!tradeTeam.description || tradeTeam.description !== standardTeam.description) {
      await prisma.tradeTeam.update({
        where: { id: tradeTeam.id },
        data: { description: standardTeam.description }
      });
      console.log(`   📝 Updated description`);
    }

    // Check which crews are missing
    const existingCrewNames = tradeTeam.crews.map(c => c.name);
    const missingCrews = standardTeam.crews.filter(c => !existingCrewNames.includes(c.name));

    if (missingCrews.length === 0) {
      console.log(`   ✅ All ${standardTeam.crews.length} standard crews exist`);
      
      // Update existing crews with scopeOfWork and isRequired if missing
      for (const crew of tradeTeam.crews) {
        const standardCrew = standardTeam.crews.find(c => c.name === crew.name);
        if (standardCrew && (!crew.scopeOfWork || crew.isRequired === null)) {
          await prisma.crew.update({
            where: { id: crew.id },
            data: {
              scopeOfWork: standardCrew.scopeOfWork,
              isRequired: standardCrew.isRequired
            }
          });
        }
      }
      continue;
    }

    console.log(`   ⚠️  Missing ${missingCrews.length} crews`);
    teamsUpdated++;

    // Create missing crews
    for (const crew of missingCrews) {
      await prisma.crew.create({
        data: {
          name: crew.name,
          scopeOfWork: crew.scopeOfWork,
          isRequired: crew.isRequired,
          tradeTeamId: tradeTeam.id,
          constructionGroupId: tradeTeam.constructionGroupId,
          isActive: true
        }
      });
      const reqLabel = crew.isRequired ? '(Required)' : '(Optional)';
      console.log(`   ➕ Created: ${crew.name} ${reqLabel}`);
      totalCrewsCreated++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Seeding complete!`);
  console.log(`   Trade Teams updated: ${teamsUpdated}`);
  console.log(`   Crews created: ${totalCrewsCreated}`);
}

seedStandardCrews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
