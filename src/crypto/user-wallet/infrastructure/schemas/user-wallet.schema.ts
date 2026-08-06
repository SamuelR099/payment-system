import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BlockchainNetwork } from 'src/shared/enums/blockchain-network.enum';
import { WalletStatus } from 'src/shared/enums/wallet-status.enum';

@Schema({ collection: 'user_wallets', timestamps: true })
export class UserWallet {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: BlockchainNetwork })
  network: BlockchainNetwork;

  @Prop({ required: true })
  walletAddress: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ required: true, enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Prop({ required: false })
  label: string;
}

export type UserWalletDocument = UserWallet & Document;

export const UserWalletSchema = SchemaFactory.createForClass(UserWallet);

UserWalletSchema.index({ userId: 1, network: 1 }, { unique: true });
UserWalletSchema.index({ userId: 1, isDefault: 1 });
