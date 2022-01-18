import { IsBoolean, IsOptional } from 'class-validator'
export class GetOrdersFilterDto {
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean
}
