<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'business_name' => fake()->company().' SAS',
            'document_type' => 'NIT',
            'document_number' => fake()->unique()->numerify('#########'),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'department' => fake()->state(),
            'country' => 'Colombia',
            'phone' => fake()->numerify('3#########'),
            'whatsapp' => fake()->numerify('3#########'),
            'email' => fake()->unique()->companyEmail(),
            'allow_system_mail_fallback' => true,
            'tax_regime' => 'Responsable de IVA',
            'subscription_status' => Company::STATUS_ACTIVE,
            'trial_ends_at' => now()->addDays(15),
        ];
    }
}
