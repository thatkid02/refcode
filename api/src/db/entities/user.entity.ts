import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AuthProvider } from './auth-provider.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    referral_code: string;

    @Column({ nullable: true })
    referred_by: number;

    @Column({ default: 0 })
    points: number;

    @Column({ nullable: true })
    access_token: string;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToMany(() => AuthProvider, authProvider => authProvider.user)
    authProviders: AuthProvider[];
}