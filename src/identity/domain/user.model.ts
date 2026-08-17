import { Language, UserRole, EmployeePosition } from 'src/shared/enums';
import { Address, UserDocument } from '../infrastructure/schemas/user.schema';

type ExtendedUserDocument = UserDocument & {
  createdAt?: Date;
  updatedAt?: Date;
};
// type ExtendedUserParams = {};

export class User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: Address | object;
  readonly language?: Language;
  readonly avatarUrl?: string;
  readonly signatureImageUrl?: string;
  readonly slackUserId?: string;
  readonly role: UserRole;
  readonly wallet?: string;
  readonly hourlyRate: number;
  readonly position?: EmployeePosition;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(params: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: Address;
    language?: Language;
    avatarUrl?: string;
    signatureImageUrl?: string;
    slackUserId?: string;
    role: UserRole;
    wallet?: string;
    hourlyRate: number;
    position?: EmployeePosition;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.email = params.email;
    this.phone = params.phone;
    this.address = params.address || {};
    this.language = params.language;
    this.avatarUrl = params.avatarUrl;
    this.signatureImageUrl = params.signatureImageUrl;
    this.slackUserId = params.slackUserId;
    this.role = params.role;
    this.wallet = params.wallet;
    this.hourlyRate = params.hourlyRate;
    this.position = params.position;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  static fromModel(
    document: ExtendedUserDocument,
    // params: ExtendedParams = {},
  ): User {
    return new User({
      id: String(document._id),
      firstName: document.profile.firstName,
      lastName: document.profile.lastName,
      email: document.email,
      phone: document.phone,
      address: document.profile.address,
      language: document.language,
      avatarUrl: document.profile.avatarUrl,
      signatureImageUrl: document.profile.signatureImageUrl,
      slackUserId: document.profile.slackUserId,
      role: document.role,
      wallet: document.wallet,
      hourlyRate: document.hourlyRate,
      position: document.profile.position,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    });
  }

  getUserInfo() {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      role: this.role,
      profile: {
        firstName: this.firstName,
        lastName: this.lastName,
        address: this.address,
        avatarUrl: this.avatarUrl,
        signatureImageUrl: this.signatureImageUrl,
        slackUserId: this.slackUserId,
        position: this.position,
        hourlyRate: this.hourlyRate,
      },
      language: this.language,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
