import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  Parent,
  ResolveField
} from '@nestjs/graphql';
import {
  FindManyOrganizationArgs,
  UpdateOneOrganizationArgs,
  InviteUserArgs
} from './dto';
import { FindOneArgs } from 'src/dto';

import { Organization, App, User } from 'src/models';
import { AppService } from 'src/core/app/app.service';
import { GqlResolverExceptionsFilter } from 'src/filters/GqlResolverExceptions.filter';
import { UseFilters, UseGuards } from '@nestjs/common';
import { UserEntity } from 'src/decorators/user.decorator';
import { GqlAuthGuard } from 'src/guards/gql-auth.guard';
import { OrganizationService } from './organization.service';

@Resolver(() => Organization)
@UseFilters(GqlResolverExceptionsFilter)
@UseGuards(GqlAuthGuard)
export class OrganizationResolver {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly appService: AppService
  ) {}

  @Query(() => Organization, {
    nullable: true,
    description: undefined
  })
  async organization(
    @Context() ctx: any,
    @Args() args: FindOneArgs
  ): Promise<Organization | null> {
    return this.organizationService.getOrganization(args);
  }

  @ResolveField(() => [App])
  async apps(@Parent() organization: Organization) {
    return this.appService.apps({
      where: { organization: { id: organization.id } }
    });
  }

  @Query(() => [Organization], {
    nullable: false,
    description: undefined
  })
  async organizations(
    @Context() ctx: any,
    @Args() args: FindManyOrganizationArgs
  ): Promise<Organization[]> {
    return this.organizationService.getOrganizations(args);
  }

  @Mutation(() => Organization, {
    nullable: true,
    description: undefined
  })
  async deleteOrganization(
    @Context() ctx: any,
    @Args() args: FindOneArgs
  ): Promise<Organization | null> {
    return this.organizationService.deleteOrganization(args);
  }

  @Mutation(() => Organization, {
    nullable: true,
    description: undefined
  })
  async updateOrganization(
    @Context() ctx: any,
    @Args() args: UpdateOneOrganizationArgs
  ): Promise<Organization | null> {
    return this.organizationService.updateOrganization(args);
  }

  @Mutation(() => User, {
    nullable: true,
    description: undefined
  })
  async inviteUser(
    @UserEntity() currentUser: User,
    @Args() args: InviteUserArgs
  ): Promise<User | null> {
    return this.organizationService.inviteUser(currentUser, args);
  }
}
