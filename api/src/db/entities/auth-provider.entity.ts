import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity'; // Assuming you have a User entity

@Entity('auth_providers')
export class AuthProvider {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number;

    @ManyToOne(() => User, (user) => user.authProviders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ length: 255 })
    provider: string;

    @Column({ length: 255 })
    provider_user_id: string;

    @Column({ type: 'jsonb' })
    provider_access_data: object;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}