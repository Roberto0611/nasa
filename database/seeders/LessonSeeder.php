<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Lesson;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lessons = [
            [
                'title' => 'Understanding Meteorite Radius',
                'slug' => 'understanding-Meteorite-radius',
                'description' => 'Learn how the radius of a Meteorite affects its impact potential and why size matters in asteroid science.',
                'content' => "# Understanding Meteorite Radius\n\n## Introduction\nThe radius of a Meteorite is one of the most critical parameters in determining its potential for causing damage upon impact with Earth. In this lesson, we'll explore why size matters and how it affects the physics of atmospheric entry and impact.\n\n## What is Meteorite Radius?\n\nThe **radius** of a Meteorite is the distance from its center to its surface. While asteroids can range from a few meters to hundreds of kilometers in diameter, most Meteorites that enter Earth's atmosphere are much smaller.\n\n### Size Classifications:\n- **Small**: < 1 meter radius (typically burn up completely)\n- **Medium**: 1-25 meters radius (can cause local damage)\n- **Large**: 25-500 meters radius (regional devastation)\n- **Massive**: > 500 meters radius (global catastrophe)\n\n## Why Radius Matters\n\n### 1. Mass Calculation\nThe mass of a spherical Meteorite is calculated using:\n\n**m = (4/3) × π × r³ × ρ**\n\nWhere:\n- m = mass (kg)\n- r = radius (m)\n- ρ = density (kg/m³)\n\nNotice that **mass increases with the cube of radius**. Doubling the radius increases the mass by 8 times!\n\n### 2. Kinetic Energy\nKinetic energy is calculated as:\n\n**KE = ½ × m × v²**\n\nSince mass depends on r³, a small increase in radius leads to a dramatic increase in impact energy.\n\n### 3. Atmospheric Interaction\nLarger Meteorites:\n- Penetrate deeper into the atmosphere\n- Are less affected by air friction\n- Have higher survival rates to ground impact\n\n## Real-World Examples\n\n### Chelyabinsk Meteor (2013)\n- **Radius**: ~10 meters\n- **Mass**: ~12,000 tons\n- **Energy**: 500 kilotons TNT\n- **Result**: Airburst at 30km altitude, broken windows across city\n\n### Tunguska Event (1908)\n- **Estimated Radius**: ~50-100 meters  \n- **Energy**: 10-15 megatons TNT\n- **Result**: Flattened 2,000 km² of Siberian forest\n\n### Chicxulub Impactor (66 million years ago)\n- **Estimated Radius**: ~5-10 kilometers\n- **Energy**: 100 million megatons TNT\n- **Result**: Global extinction event (dinosaurs)\n\n## Key Takeaways\n\n1. **Cubic Relationship**: Mass (and thus energy) grows as the cube of radius\n2. **Atmospheric Filtering**: Earth's atmosphere is excellent at stopping small Meteorites\n3. **Threshold Effect**: There's a critical size (~25m radius) where regional damage becomes significant\n4. **Detection Importance**: Spotting larger objects early gives us more time to react",
                'category' => 'Physics',
                'difficulty_level' => 1,
                'duration_minutes' => 12,
                'icon' => '📏',
                'practical_task' => 'Try the simulator with three different Meteorite radii: 5m, 25m, and 100m. Keep all other parameters the same (material: rock, velocity: 15 km/s, angle: 45°). Compare the crater diameters and impact energies. Which one causes the most dramatic difference?',
                'learning_objectives' => [
                    'Understand the cubic relationship between radius and mass',
                    'Calculate Meteorite mass from radius and density',
                    'Recognize the threshold sizes for atmospheric survival',
                    'Apply radius concepts to real-world impact events'
                ],
                'key_concepts' => [
                    'Radius', 'Mass', 'Volume', 'Cubic scaling', 'Atmospheric entry'
                ],
                'is_published' => true,
                'order' => 1
            ],
            [
                'title' => 'Impact Velocity and Kinetic Energy',
                'slug' => 'impact-velocity-kinetic-energy',
                'description' => 'Discover how velocity dramatically affects the destructive power of meteorite impacts.',
                'content' => "# Impact Velocity and Kinetic Energy\n\n## Introduction\nWhile the size of a Meteorite is important, its **velocity** is equally critical in determining the energy released upon impact.\n\n## The Kinetic Energy Formula\n\n**KE = ½ × m × v²**\n\nWhere:\n- KE = kinetic energy (joules)\n- m = mass (kg)\n- v = velocity (m/s)\n\n### The Squared Relationship\n\nNotice that velocity is **squared** in the equation. This means:\n- Doubling the velocity **quadruples** the energy\n- Tripling the velocity gives **nine times** the energy\n\n## Typical Meteorite Velocities\n\n### Velocity Ranges:\n- **Minimum**: ~11 km/s (Earth's escape velocity)\n- **Average**: ~17-20 km/s\n- **Maximum**: ~72 km/s (head-on collision)\n\n## Energy Comparison\n\nTwo Meteorites with the same mass (10,000 kg):\n\n**Meteorite A** (15 km/s):\n- KE = ½ × 10,000 × (15,000)² = 1.125 × 10¹² joules\n- **Equivalent**: 269 tons of TNT\n\n**Meteorite B** (30 km/s):\n- KE = ½ × 10,000 × (30,000)² = 4.5 × 10¹² joules\n- **Equivalent**: 1,076 tons of TNT\n\n**Meteorite B has 4 times the energy!**",
                'category' => 'Physics',
                'difficulty_level' => 1,
                'duration_minutes' => 15,
                'icon' => '⚡',
                'practical_task' => 'In the simulator, create a 10-meter radius rock Meteorite and test it at three velocities: 15 km/s, 30 km/s, and 50 km/s. Keep the angle at 45°. Record the kinetic energy (in megatons TNT) for each. Does the energy quadruple when you double the velocity?',
                'learning_objectives' => [
                    'Master the kinetic energy formula',
                    'Calculate impact energy from mass and velocity',
                    'Understand typical Meteorite velocity ranges',
                    'Convert joules to TNT equivalent'
                ],
                'key_concepts' => [
                    'Kinetic energy', 'Velocity', 'Squared relationship', 'TNT equivalence'
                ],
                'is_published' => true,
                'order' => 2
            ],
            [
                'title' => 'Atmospheric Entry and Fragmentation',
                'slug' => 'atmospheric-entry-fragmentation',
                'description' => 'Learn how Earth\'s atmosphere acts as a shield, breaking apart most Meteorites.',
                'content' => "# Atmospheric Entry and Fragmentation\n\n## Introduction\nEarth's atmosphere is our first line of defense against space rocks. This lesson explores how air resistance, heat, and pressure work together to destroy Meteorites.\n\n## The Atmospheric Shield\n\nMost Meteorite destruction happens in the **mesosphere** (50-80 km altitude).\n\n## Three Forces of Destruction\n\n### 1. Aerodynamic Heating\n- **Surface temperature**: 1,650°C to 2,750°C\n- **Plasma formation**: Air ionizes\n- **Ablation**: Surface material vaporizes\n\n### 2. Ram Pressure\n**q = ½ × ρ × v²**\n\nWhen this exceeds material strength, the Meteorite breaks apart.\n\n### 3. Differential Stress\nDifferent parts experience different forces, pulling the object apart.\n\n## Material Strength Rankings:\n1. **Iron**: ~10⁸ Pa (survives often)\n2. **Stone**: ~10⁷ Pa (may fragment)\n3. **Rubble**: ~10⁵ Pa (disintegrates easily)\n\n## Size Threshold\n- **< 10m**: Burns up\n- **10-25m**: Possible airburst\n- **25-100m**: Reaches low altitude/ground\n- **> 100m**: Definitely ground impact",
                'category' => 'Atmospheric Science',
                'difficulty_level' => 2,
                'duration_minutes' => 20,
                'icon' => '🌍',
                'practical_task' => 'Test the atmosphere! Create three 30-meter Meteorites: rock, iron, and rubble. Use velocity 25 km/s and angle 60°. Which fragments? Which survives? Check the "Atmospheric Effects" energy remaining percentage.',
                'learning_objectives' => [
                    'Understand forces that destroy Meteorites',
                    'Calculate ram pressure',
                    'Distinguish airburst vs ground impact',
                    'Recognize material strength effects'
                ],
                'key_concepts' => [
                    'Atmospheric entry', 'Ram pressure', 'Fragmentation', 'Airburst', 'Material strength'
                ],
                'is_published' => true,
                'order' => 3
            ]
        ];

        foreach ($lessons as $lessonData) {
            Lesson::create($lessonData);
        }
    }
}

