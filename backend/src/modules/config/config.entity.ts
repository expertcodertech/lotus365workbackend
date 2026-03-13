import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('app_config')
export class AppConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    key: string;

    @Column({ type: 'jsonb' })
    value: any;

    @Column({ nullable: true })
    description: string;

    @UpdateDateColumn()
    updatedAt: Date;
}
