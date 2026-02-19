<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Ticket;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    public function definition(): array
    {
        $status = fake()->randomElement(Ticket::statuses());

        return [
            'client_id' => Client::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'type' => fake()->randomElement(['Soporte', 'Hardware', 'Software']),
            'observation' => fake()->optional()->sentence(),
            'estimated_price' => fake()->randomFloat(2, 50, 500),
            'status' => $status,
            'closed_at' => $status === Ticket::STATUS_CLOSED ? now() : null,
        ];
    }
}
