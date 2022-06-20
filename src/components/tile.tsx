import styled from 'styled-components'
import { useEffect, useState, useCallback } from 'react'

export interface TileProps {
    title: string
    icon: any
    onClick?: any
    toggled?: any
}

const RoundedCornerTile = styled.button<{active: boolean}>`
    border-style: solid;
    border-width: 3px;
    border-radius: 25px 25px 25px 25px;
    border-color: #CCCCCC;
    background: #F2F2F2;
    color: ${props => props.active ? 'red' : '#AAAAAA' };
    width: 200px;
    height: 200px;
`

const Icon = styled.span<{active: boolean}>`
    font-size: 100px;
    color: ${props => props.active ? 'red' : '#AAAAAA' };
`

const TileComponent = (props: TileProps) => {
    return (
        <RoundedCornerTile active={props.toggled} onClick={props.onClick}>
            <h3>{props.title}</h3>
            <Icon active={props.toggled}>{props.icon}</Icon>
        </RoundedCornerTile>
    )
}

export default TileComponent